import en from '@/i18n/en.json';
import fr from '@/i18n/fr.json';
import { siteConfig } from '@/config/site';
import { routing, type Locale } from '@/i18n/routing';

type EmailBundle = typeof en.emails;

const bundles: Record<Locale, EmailBundle> = {
  en: en.emails,
  fr: fr.emails,
};

function resolveLocale(locale?: string | null): Locale {
  if (locale && routing.locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return routing.defaultLocale;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

export function getApplicationReceivedEmail(
  locale: string | null | undefined,
  name: string,
) {
  const loc = resolveLocale(locale);
  const copy = bundles[loc].applicationReceived;
  const vars = { name, siteName: siteConfig.name };

  return {
    subject: copy.subject,
    html: `
      <p>${interpolate(copy.greeting, vars)}</p>
      <p>${interpolate(copy.body, vars)}</p>
      <p>${interpolate(copy.signoff, vars)}</p>
    `,
  };
}

export function getContactAdminEmail(data: {
  full_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  const copy = bundles.en.contactAdmin;
  return {
    subject: interpolate(copy.subject, { subject: data.subject }),
    html: `
      <p><strong>${copy.from}:</strong> ${data.full_name} &lt;${data.email}&gt;</p>
      ${data.phone ? `<p><strong>${copy.phone}:</strong> ${data.phone}</p>` : ''}
      <p><strong>${copy.subjectLabel}:</strong> ${data.subject}</p>
      <hr />
      <p>${data.message.replace(/\n/g, '<br/>')}</p>
    `,
  };
}
