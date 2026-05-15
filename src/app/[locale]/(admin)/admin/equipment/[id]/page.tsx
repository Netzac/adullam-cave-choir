'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { EquipmentRecord, GalleryItem } from '@/types/database';
import { EquipmentRecordForm } from '@/components/admin/EquipmentRecordForm';
import { pickThumbnail } from '@/components/admin/galleryHelpers';

export default function AdminEditEquipmentRecordPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const t = useTranslations('adminEquipment.form');
  const detailT = useTranslations('adminEquipment.detail');
  const linkedT = useTranslations('adminEquipment.detail.linkedGallery');

  const [record, setRecord] = React.useState<EquipmentRecord | null>(null);
  const [linkedGallery, setLinkedGallery] = React.useState<GalleryItem[]>([]);
  const [linkedIds, setLinkedIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    (async () => {
      const recordResult = await supabase
        .from('equipment_records')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (cancelled) return;

      if (recordResult.error) {
        console.error('Failed to load equipment record', recordResult.error);
        setLoadError(detailT('loadError'));
        setRecord(null);
        setLinkedGallery([]);
        setLinkedIds([]);
        setLoading(false);
        return;
      }

      const loaded = (recordResult.data as EquipmentRecord | null) ?? null;
      setRecord(loaded);
      setLoadError(null);

      if (!loaded) {
        setLinkedGallery([]);
        setLinkedIds([]);
        setLoading(false);
        return;
      }

      const linksResult = await supabase
        .from('equipment_gallery')
        .select('gallery_item_id, gallery_items(*)')
        .eq('equipment_record_id', id);

      if (cancelled) return;

      if (linksResult.error) {
        console.error('Failed to load linked gallery', linksResult.error);
        setLinkedGallery([]);
        setLinkedIds([]);
      } else {
        const gallery = (linksResult.data ?? [])
          .map(
            (row) =>
              (row as unknown as { gallery_items: GalleryItem | null })
                .gallery_items
          )
          .filter((item): item is GalleryItem => item !== null);
        setLinkedGallery(gallery);
        setLinkedIds(gallery.map((item) => item.id));
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, detailT]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>{detailT('loading')}</span>
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <div className="space-y-6">
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
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-rose-700">
            {loadError ?? detailT('notFound')}
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {t('editTitle')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {record.church_name} · {t('editSubtitle')}
          </p>
        </div>
      </header>

      {linkedGallery.length > 0 ? (
        <Card>
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-semibold text-foreground">
                {linkedT('title')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {linkedT('subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {linkedGallery.map((item) => {
                const thumb = pickThumbnail(item);
                return (
                  <figure
                    key={item.id}
                    className="overflow-hidden rounded-lg border border-border/60 bg-card shadow-sm"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dynamic
                        <img
                          src={thumb}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" aria-hidden />
                        </div>
                      )}
                    </div>
                    <figcaption className="line-clamp-1 px-2 py-1.5 text-xs font-medium text-foreground">
                      {item.title}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-5 sm:p-8">
          <EquipmentRecordForm
            mode="edit"
            record={record}
            linkedGalleryIds={linkedIds}
          />
        </CardContent>
      </Card>
    </div>
  );
}
