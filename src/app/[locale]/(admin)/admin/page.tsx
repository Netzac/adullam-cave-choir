import { redirect } from '@/i18n/navigation';

interface AdminIndexPageProps {
  params: { locale: string };
}

export default function AdminIndexPage({ params }: AdminIndexPageProps) {
  redirect({ href: '/admin/dashboard', locale: params.locale });
}
