import type { NextPage } from 'next';
import Head from 'next/head';
import { ContactForm } from '../src/components/contactForm';
import { Layout } from '../src/components/layout';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Custom Timeline Entries NextJS Example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <ContactForm />
      </Layout>
    </>
  );
};

export default Home;
