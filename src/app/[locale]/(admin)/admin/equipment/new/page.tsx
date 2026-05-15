'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EquipmentRecordForm } from '@/components/admin/EquipmentRecordForm';

export default function AdminNewEquipmentRecordPage() {
  const t = useTranslations('adminEquipment.form');

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Button
          asChild
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1.5 text-muted-foreground"
        >
          <Link href="/admin/equipment">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('back')}
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('newTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('newSubtitle')}</p>
        </div>
      </header>

      <Card>
        <CardContent className="p-5 sm:p-8">
          <EquipmentRecordForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
