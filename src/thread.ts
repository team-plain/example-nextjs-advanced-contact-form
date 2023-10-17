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
