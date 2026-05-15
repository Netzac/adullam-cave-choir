import { RootLayout as Shell } from '@/components/layout/RootLayout';

export default function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <Shell locale={params.locale}>{children}</Shell>;
}
