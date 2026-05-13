import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = (await import(`./${locale}.json`)).default;
    return { locale, messages };
  } catch {
    notFound();
  }
});
