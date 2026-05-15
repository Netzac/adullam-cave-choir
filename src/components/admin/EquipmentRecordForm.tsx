'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Search,
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  EQUIPMENT_STATUS_VALUES,
  EQUIPMENT_TYPE_VALUES,
  equipmentRecordSchema,
  type EquipmentRecordInput,
} from '@/lib/validations/equipmentSchema';
import type {
  EquipmentRecord,
  EquipmentStatus,
  GalleryItem,
} from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { pickThumbnail } from '@/components/admin/galleryHelpers';

type EquipmentFormInput = z.input<typeof equipmentRecordSchema>;

interface EquipmentRecordFormProps {
  mode: 'create' | 'edit';
  record?: EquipmentRecord;
  linkedGalleryIds?: string[];
}

export function EquipmentRecordForm({
  mode,
  record,
  linkedGalleryIds = [],
}: EquipmentRecordFormProps) {
  const t = useTranslations('adminEquipment.form');
  const fieldsT = useTranslations('adminEquipment.form.fields');
  const placeholdersT = useTranslations('adminEquipment.form.placeholders');
  const typesT = useTranslations('adminEquipment.form.equipmentTypes');
  const galleryT = useTranslations('adminEquipment.form.gallery');
  const statusT = useTranslations('adminEquipment.status');
  const router = useRouter();

  const [submitting, setSubmitting] = React.useState(false);
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = React.useState(true);
  const [gallerySearch, setGallerySearch] = React.useState('');

  const defaults = React.useMemo<EquipmentFormInput>(
    () => ({
      church_name: record?.church_name ?? '',
      location: record?.location ?? '',
      service_date: record?.service_date ?? '',
      equipment_types: record?.equipment_types ?? [],
      notes: record?.notes ?? '',
      status: record?.status ?? 'planned',
      gallery_item_ids: linkedGalleryIds,
    }),
    [record, linkedGalleryIds]
  );

  const form = useForm<EquipmentFormInput, unknown, EquipmentRecordInput>({
    resolver: zodResolver(equipmentRecordSchema),
    mode: 'onTouched',
    defaultValues: defaults,
  });

  React.useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  // Load gallery items for the picker.
  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setGalleryLoading(true);
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load gallery items', error);
          setGalleryItems([]);
        } else {
          setGalleryItems((data ?? []) as GalleryItem[]);
        }
        setGalleryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTypes = form.watch('equipment_types') ?? [];
  const selectedGalleryIds = form.watch('gallery_item_ids') ?? [];

  const toggleType = React.useCallback(
    (value: string) => {
      const set = new Set<string>(selectedTypes as string[]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      form.setValue('equipment_types', Array.from(set), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [selectedTypes, form]
  );

  const toggleGalleryItem = React.useCallback(
    (id: string) => {
      const set = new Set<string>(selectedGalleryIds as string[]);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      form.setValue('gallery_item_ids', Array.from(set), {
        shouldDirty: true,
      });
    },
    [selectedGalleryIds, form]
  );

  const filteredGallery = React.useMemo(() => {
    const term = gallerySearch.trim().toLowerCase();
    if (!term) return galleryItems;
    return galleryItems.filter((item) =>
      item.title.toLowerCase().includes(term)
    );
  }, [galleryItems, gallerySearch]);

  const onSubmit = async (data: EquipmentRecordInput) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        church_name: data.church_name,
        location: data.location,
        service_date: data.service_date,
        equipment_types: data.equipment_types,
        notes: data.notes,
        status: data.status,
      };

      let recordId: string;
      if (mode === 'edit' && record) {
        const { error } = await supabase
          .from('equipment_records')
          .update(payload)
          .eq('id', record.id);
        if (error) throw error;
        recordId = record.id;
      } else {
        // Insert without status, then patch if needed (DB has default).
        const { status, ...insertable } = payload;
        const { data: inserted, error: insertError } = await supabase
          .from('equipment_records')
          .insert(insertable)
          .select('id')
          .single();
        if (insertError) throw insertError;
        recordId = inserted.id;
        if (status !== 'planned') {
          const { error: updateError } = await supabase
            .from('equipment_records')
            .update({ status })
            .eq('id', recordId);
          if (updateError) throw updateError;
        }
      }

      // Reconcile linked gallery items.
      const desiredIds = new Set<string>(data.gallery_item_ids ?? []);
      const previousIds = new Set<string>(linkedGalleryIds);

      const toInsert = Array.from(desiredIds).filter(
        (id) => !previousIds.has(id)
      );
      const toDelete = Array.from(previousIds).filter(
        (id) => !desiredIds.has(id)
      );

      if (toInsert.length > 0) {
        const { error: linkError } = await supabase
          .from('equipment_gallery')
          .insert(
            toInsert.map((galleryId) => ({
              equipment_record_id: recordId,
              gallery_item_id: galleryId,
            }))
          );
        if (linkError) throw linkError;
      }
      if (toDelete.length > 0) {
        const { error: unlinkError } = await supabase
          .from('equipment_gallery')
          .delete()
          .eq('equipment_record_id', recordId)
          .in('gallery_item_id', toDelete);
        if (unlinkError) throw unlinkError;
      }

      if (mode === 'edit') {
        toast.success(t('successUpdate'));
        router.refresh();
      } else {
        toast.success(t('successCreate'));
        router.push('/admin/equipment');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to save equipment record', err);
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldGroup className="sm:col-span-2" error={errors.church_name?.message}>
          <Label htmlFor="equipment-church">{fieldsT('churchName')}</Label>
          <Input
            id="equipment-church"
            placeholder={placeholdersT('churchName')}
            autoComplete="off"
            {...form.register('church_name')}
          />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.location?.message}>
          <Label htmlFor="equipment-location">{fieldsT('location')}</Label>
          <Input
            id="equipment-location"
            placeholder={placeholdersT('location')}
            {...form.register('location')}
          />
        </FieldGroup>

        <FieldGroup error={errors.service_date?.message}>
          <Label htmlFor="equipment-service-date">
            {fieldsT('serviceDate')}
          </Label>
          <Input
            id="equipment-service-date"
            type="date"
            {...form.register('service_date')}
          />
        </FieldGroup>

        <FieldGroup error={errors.status?.message}>
          <Label htmlFor="equipment-status">{fieldsT('status')}</Label>
          <Select
            value={form.watch('status') ?? 'planned'}
            onValueChange={(value) =>
              form.setValue('status', value as EquipmentStatus, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="equipment-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_STATUS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {statusT(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>

        <FieldGroup
          className="sm:col-span-2"
          error={errors.equipment_types?.message as string | undefined}
        >
          <Label>{fieldsT('equipmentTypes')}</Label>
          <p className="text-xs text-muted-foreground">
            {fieldsT('equipmentTypesHint')}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {EQUIPMENT_TYPE_VALUES.map((value) => {
              const active = (selectedTypes as string[]).includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleType(value)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'border-purple-700 bg-purple-700 text-white'
                      : 'border-border bg-background text-foreground/80 hover:bg-muted/60'
                  )}
                >
                  {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                  {typesT(value)}
                </button>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.notes?.message}>
          <Label htmlFor="equipment-notes">{fieldsT('notes')}</Label>
          <Textarea
            id="equipment-notes"
            rows={4}
            placeholder={placeholdersT('notes')}
            {...form.register('notes')}
          />
          <p className="text-xs text-muted-foreground">{fieldsT('notesHint')}</p>
        </FieldGroup>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <Label>{fieldsT('gallery')}</Label>
              <p className="text-xs text-muted-foreground">
                {fieldsT('galleryHint')}
              </p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {galleryT('selected', {
                count: (selectedGalleryIds as string[]).length,
              })}
            </p>
          </div>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={gallerySearch}
              onChange={(event) => setGallerySearch(event.target.value)}
              placeholder={galleryT('search')}
              className="pl-9"
            />
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            {galleryLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>Loading…</span>
              </div>
            ) : filteredGallery.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                {galleryT('empty')}
              </p>
            ) : (
              <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
                {filteredGallery.map((item) => {
                  const selected = (selectedGalleryIds as string[]).includes(
                    item.id
                  );
                  const thumb = pickThumbnail(item);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleGalleryItem(item.id)}
                      aria-pressed={selected}
                      className={cn(
                        'group relative overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-all',
                        selected
                          ? 'border-purple-700 ring-2 ring-purple-500/30'
                          : 'border-border/60 hover:border-border'
                      )}
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
                        {selected ? (
                          <span className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-700 text-white shadow">
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        ) : null}
                      </div>
                      <p className="line-clamp-1 px-2 py-1.5 text-xs font-medium text-foreground">
                        {item.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/equipment')}
          disabled={submitting}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {submitting
            ? t('submitting')
            : mode === 'edit'
              ? t('submitUpdate')
              : t('submitCreate')}
        </Button>
      </div>
    </form>
  );
}

function FieldGroup({
  className,
  error,
  children,
}: {
  className?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
