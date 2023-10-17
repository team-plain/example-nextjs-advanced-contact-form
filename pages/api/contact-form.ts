import { inspect } from 'util';
import {
  uiComponent,
  CreateThreadInput,
  PlainClient,
  PlainSDKError,
} from '@team-plain/typescript-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import UAParser from 'ua-parser-js';

const apiKey = process.env.PLAIN_API_KEY;

if (!apiKey) {
  throw new Error('PLAIN_API_KEY environment variable is not set');
}

const client = new PlainClient({
  apiKey,
});

export type ResponseData = {
  error: string | null;
};

export type RequestBody = {
  name: string;
  email: string;
  title: string;
  components: CreateThreadInput['components'];
  labelTypeIds: string[];
  priority: 0 | 1 | 2 | 3 | number;
};

function logError(err: PlainSDKError) {
  // This ensures the full error is logged
  console.error(inspect(err, { showHidden: false, depth: null, colors: true }));
}



/**
 * The API handler, this is what accepts our contact form request and submits it to Plain
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // In production validation of the request body might be necessary.
  const reqBody = JSON.parse(req.body) as RequestBody;

  const upsertCustomerRes = await client.upsertCustomer({
    identifier: {
      emailAddress: reqBody.email,
    },
    onCreate: {
      fullName: reqBody.name,
      email: {
        email: reqBody.email,
        isVerified: true,
      },
    },
    onUpdate: {},
  });

  if (upsertCustomerRes.error) {
    logError(upsertCustomerRes.error);
    return res.status(500).json({ error: upsertCustomerRes.error.message });
  }

  console.log(`Customer upserted ${upsertCustomerRes.data.customer.id}`);

  const createThreadRes = await client.createThread({
    customerIdentifier: {
      customerId: upsertCustomerRes.data.customer.id,
    },
    title: reqBody.title,
    components: reqBody.components,
    labelTypeIds: reqBody.labelTypeIds,
    priority: reqBody.priority,
  });

  if (createThreadRes.error) {
    logError(createThreadRes.error);
    return res.status(500).json({ error: createThreadRes.error.message });
  }

  console.log(`Thread created ${createThreadRes.data.id}`);

  res.status(200).json({ error: null });
}
