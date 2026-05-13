import { redirect } from '@/i18n/navigation';
import { headers } from 'next/headers';

export default async function WorkshopsRedirect() {
  const h = await headers();
  const locale = (h.get('x-next-intl-locale') as 'en' | 'fr' | null) ?? 'en';
  redirect({ href: '/events', locale });
}
