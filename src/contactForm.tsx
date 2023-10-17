import { useState } from 'react';
import { SelectInput } from './components/selectInput';
import { FormField } from './components/formField';
import { TextInput } from './components/textInput';
import styles from './contactForm.module.css';
import { Textarea } from './components/textarea';
import { Checkbox } from './components/checkbox';
import { Button } from './components/button';

import { toast } from 'react-hot-toast';
import { RequestBody } from '../pages/api/contact-form';

import { CreateThreadInput, uiComponent } from '@team-plain/typescript-sdk';
import UAParser from 'ua-parser-js';

export function componentsForBug(bugDescription: string): CreateThreadInput['components'] {
  const parser = new UAParser(window.navigator.userAgent);
  const browser = parser.getBrowser();

  return [
    uiComponent.text({ text: bugDescription }),
    uiComponent.spacer({ spacingSize: 'S' }),
    uiComponent.text({
      text: `Reported on ${window.location.href} using ${browser.name} (${browser.version})`,
      size: 'S',
      color: 'MUTED',
    }),
  ];
}

export function componentsForFeatureRequest(featureRequest: string) {
  return [uiComponent.text({ text: featureRequest })];
}

export function componentsForQuestion(question: string) {
  return [uiComponent.text({ text: question })];
}

export function componentsForSecurityTreport(securityIssue: string) {
  return [uiComponent.text({ text: securityIssue })];
}

export function componentsForDemoRequest(
  demoMessage: string,
  currentProvider: string,
  expectedVolume: string
) {
  return [
    ...(demoMessage
      ? [uiComponent.text({ text: demoMessage }), uiComponent.spacer({ spacingSize: 'S' })]
      : []),
    uiComponent.row({
      mainContent: [uiComponent.text({ text: 'Current provider', color: 'MUTED' })],
      asideContent: [
        uiComponent.text({
          text: currentProvider,
        }),
      ],
    }),
    uiComponent.row({
      mainContent: [uiComponent.text({ text: 'Expected volume', color: 'MUTED' })],
      asideContent: [
        uiComponent.text({
          text: expectedVolume,
        }),
      ],
    }),
  ];
}

function isString(s: unknown): s is string {
  return typeof s === 'string';
}

function getLabelTypeIds(formType: FormType): string[] {
  if (formType === null) {
    return [];
  }

  const formTypeIdsMap: Record<NonNullable<FormType>, Array<string | undefined>> = {
    bug: [process.env.NEXT_PUBLIC_PLAIN_LABEL_TYPE_ID_BUG],
    demo: [process.env.NEXT_PUBLIC_PLAIN_LABEL_TYPE_ID_DEMO],
    feature: [process.env.NEXT_PUBLIC_PLAIN_LABEL_TYPE_ID_FEATURE],
    question: [process.env.NEXT_PUBLIC_PLAIN_LABEL_TYPE_ID_QUESTION],
    security: [process.env.NEXT_PUBLIC_PLAIN_LABEL_TYPE_ID_SECURITY],
  };
  return formTypeIdsMap[formType].filter(isString);
}

function getPriority(formType: FormType, bugIsBlocking: boolean): 0 | 1 | 2 | 3 {
  // We want to treat any security issues reported to us as urgent
  if (formType === 'security') {
    return 0;
  }

  // We want to treat urgent bug reports as being high priority
  if (formType === 'bug' && bugIsBlocking) {
    return 1;
  }

  // Default to a normal priority
  return 2;
}

function getTitle(formType: FormType): string {
  if (formType === null) {
    return 'Contact form';
  }

  const titleMap: Record<NonNullable<FormType>, string> = {
    bug: 'Bug report',
    demo: 'Demo request',
    feature: 'Feature suggestion',
    question: 'Question',
    security: 'Security report',
  };
  return titleMap[formType];
}

const formOptions = [
  {
    label: 'Report a bug',
    value: 'bug' as const,
  },
  {
    label: 'Book a demo',
    value: 'demo' as const,
  },
  {
    label: 'Suggest a feature',
    value: 'feature' as const,
  },
  {
    label: 'Report a security issue',
    value: 'security' as const,
  },
  {
    label: 'Something else',
    value: 'question' as const,
  },
];

const demoCurrentProviderOptions = [
  { label: 'Acme', value: 'acme' as const },
  { label: 'Juniper', value: 'juniper' as const },
  { label: 'Resolve', value: 'resolve' as const },
  { label: 'Other', value: 'other' as const },
  { label: 'No, setting up for the first time', value: 'none' as const },
];

const demoExpectedVolumeOptions = [
  { label: "I'm not sure", value: 'no' as const },
  { label: 'Up to 500/month', value: '<500' as const },
  { label: 'Up to 10,000/month', value: '<10,000' as const },
  { label: 'Up to 50,000/month', value: '<50,000' as const },
  { label: 'More than 50,000/month', value: '>50,000' as const },
];

export type FormType = (typeof formOptions)[number]['value'] | null;

export function ContactForm() {
  const [formType, setFormType] = useState<FormType>(null);
  const [name, setFullName] = useState('');
  const [email, setEmailAddress] = useState('');

  // Bug form
  const [bugDescription, setBugDescription] = useState('');
  const [bugIsBlocking, setBugIsBlocking] = useState(false);

  // Feature request
  const [featureRequest, setFeatureRequest] = useState('');

  // Demo form
  const [demoCurrentProvider, setDemoCurrentProvider] = useState<string>('');
  const [demoExpectedVolume, setDemoExpectedVolume] = useState<
    (typeof demoExpectedVolumeOptions)[number]['value']
  >(demoExpectedVolumeOptions[0].value);
  const [demoMessage, setDemoMessage] = useState('');

  // Question
  const [question, setQuestion] = useState('');

  // Security
  const [securityIssue, setSecurityIssue] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  function clearForm() {
    setFormType(null);

    setFullName('');
    setEmailAddress('');
    setBugDescription('');
    setBugIsBlocking(false);
    setFeatureRequest('');
    setDemoCurrentProvider('');
    setDemoExpectedVolume(demoExpectedVolumeOptions[0].value);
    setDemoMessage('');
    setQuestion('');
    setSecurityIssue('');

    setIsProcessing(false);
  }

  function getComponentsInput(): RequestBody['components'] {
    if (!formType) {
      throw new Error('form not set');
    }

    switch (formType) {
      case 'bug':
        return componentsForBug(bugDescription);
      case 'feature':
        return componentsForFeatureRequest(featureRequest);
      case 'question':
        return componentsForQuestion(question);
      case 'security':
        return componentsForSecurityTreport(securityIssue);
      case 'demo':
        return componentsForDemoRequest(
          demoMessage,
          demoCurrentProviderOptions.find((o) => o.value === demoCurrentProvider)?.label || '',
          demoExpectedVolumeOptions.find((o) => o.value === demoExpectedVolume)?.label || ''
        );
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsProcessing(true);

    const body: RequestBody = {
      name,
      email,
      title: getTitle(formType),
      components: getComponentsInput(),
      labelTypeIds: getLabelTypeIds(formType),
      priority: getPriority(formType, bugIsBlocking),
    };

    try {
      const result = await fetch('/api/contact-form/', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (result.ok) {
        clearForm();
        toast.success('Success!');
      } else {
        toast.error('Oops');
      }
    } catch (error) {
      console.error(error);
      toast.error('Oops');
    }

    setIsProcessing(false);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.basicDetails}>
        <FormField label="Your name">
          <TextInput value={name} onChange={setFullName} placeholder="e.g. Grace Hopper" />
        </FormField>
        <FormField label="Your email">
          <TextInput value={email} onChange={setEmailAddress} placeholder="e.g. grace@gmail.com" />
        </FormField>
      </div>
      <FormField label="What do you need help with?">
        <SelectInput
          options={formOptions}
          onChange={setFormType}
          value={formType}
          placeholder="What you need help with"
        />
      </FormField>

      {formType === 'bug' && (
        <>
          <FormField
            label="What did you find?"
            helpText="The more descriptive the better. We _love_ fixing bugs but we need to be able to reproduce them first."
          >
            <Textarea value={bugDescription} onChange={setBugDescription} placeholder="When I..." />
          </FormField>
          <FormField label="Is this really bad?">
            <Checkbox
              label="Yes, this is preventing me from using this software."
              isChecked={bugIsBlocking}
              onChange={setBugIsBlocking}
            />
          </FormField>
        </>
      )}

      {formType === 'demo' && (
        <>
          <FormField label="Are you currently using another provider?">
            <SelectInput
              options={demoCurrentProviderOptions}
              value={demoCurrentProvider}
              placeholder="Current provider"
              onChange={setDemoCurrentProvider}
            />
          </FormField>
          <FormField label="How many API calls do you think expect to make?">
            <SelectInput
              placeholder="Expected transaction volume"
              options={demoExpectedVolumeOptions}
              value={demoExpectedVolume}
              onChange={setDemoExpectedVolume}
            />
          </FormField>
          <FormField
            label="Anything else we should know?"
            helpText="Anything you want to make sure we run through in our demo for example?"
          >
            <Textarea
              value={demoMessage}
              onChange={setDemoMessage}
              placeholder={`e.g. "I'd love to invite Jon at jon-the-cto@acme.com"`}
            />
          </FormField>
        </>
      )}

      {formType === 'question' && (
        <>
          <FormField label="What's on your mind?">
            <Textarea value={question} onChange={setQuestion} placeholder="Enter your question…" />
          </FormField>
        </>
      )}

      {formType === 'feature' && (
        <>
          <FormField label="What's your idea?">
            <Textarea
              value={featureRequest}
              onChange={setFeatureRequest}
              placeholder="It would be great if…"
            />
          </FormField>
        </>
      )}

      {formType === 'security' && (
        <>
          <FormField
            label="What did you find?"
            helpText="We will get back to you, at the latest, in 48 hours."
          >
            <Textarea value={securityIssue} onChange={setSecurityIssue} placeholder="When I…" />
          </FormField>
        </>
      )}

      <div className={styles.buttonRow}>
        <Button label="Send" isLoading={isProcessing} isDisabled={isProcessing || !formType} />
        <div className={styles.eta}>We respond within 2 hours.</div>
      </div>
    </form>
  );
}
