'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { GalleryCategory, GalleryItem } from '@/types/database';
import {
  GALLERY_CATEGORY_VALUES,
  galleryItemEditSchema,
  type GalleryItemEditInput,
} from '@/lib/validations/gallerySchema';

type EditFormInput = z.input<typeof galleryItemEditSchema>;

interface GalleryItemEditDialogProps {
  item: GalleryItem | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (item: GalleryItem) => void;
  onDeleted: (id: string) => void;
}

export function GalleryItemEditDialog({
  item,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: GalleryItemEditDialogProps) {
  const t = useTranslations('adminGallery.edit');
  const categoryT = useTranslations('adminGallery.categoryLabel');
  const fieldsT = useTranslations('adminGallery.edit.fields');
  const confirmT = useTranslations('adminGallery.edit.deleteConfirm');

  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const form = useForm<EditFormInput, unknown, GalleryItemEditInput>({
    resolver: zodResolver(galleryItemEditSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      category: 'performances',
      is_featured: false,
      is_published: false,
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        title: item.title,
        description: item.description ?? '',
        category: item.category,
        is_featured: item.is_featured,
        is_published: item.is_published,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: GalleryItemEditInput) => {
    if (!item) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: updated, error } = await supabase
        .from('gallery_items')
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          is_featured: data.is_featured,
          is_published: data.is_published,
        })
        .eq('id', item.id)
        .select()
        .single();
      if (error) throw error;
      toast.success(t('saved'));
      onUpdated(updated as GalleryItem);
      onClose();
    } catch (err) {
      console.error('Failed to save gallery item', err);
      toast.error(t('errors.save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
      toast.success(t('deleted'));
      onDeleted(item.id);
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete gallery item', err);
      toast.error(t('errors.delete'));
    } finally {
      setDeleting(false);
    }
  };

  const errors = form.formState.errors;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !saving && !deleting) onClose();
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>

          {item ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="gallery-edit-title">{fieldsT('title')}</Label>
                <Input
                  id="gallery-edit-title"
                  autoComplete="off"
                  {...form.register('title')}
                />
                {errors.title?.message ? (
                  <p role="alert" className="text-xs font-medium text-rose-700">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gallery-edit-description">
                  {fieldsT('description')}
                </Label>
                <Textarea
                  id="gallery-edit-description"
                  rows={4}
                  {...form.register('description')}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gallery-edit-category">
                  {fieldsT('category')}
                </Label>
                <Select
                  value={form.watch('category') ?? 'performances'}
                  onValueChange={(value) =>
                    form.setValue('category', value as GalleryCategory, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="gallery-edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GALLERY_CATEGORY_VALUES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {categoryT(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleRow
                  id="gallery-edit-featured"
                  label={fieldsT('isFeatured')}
                  value={!!form.watch('is_featured')}
                  onChange={(next) =>
                    form.setValue('is_featured', next, { shouldDirty: true })
                  }
                />
                <ToggleRow
                  id="gallery-edit-published"
                  label={fieldsT('isPublished')}
                  value={!!form.watch('is_published')}
                  onChange={(next) =>
                    form.setValue('is_published', next, { shouldDirty: true })
                  }
                />
              </div>

              <DialogFooter className="gap-2 pt-2 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmOpen(true)}
                  disabled={saving || deleting}
                  className="gap-1.5 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  {t('delete')}
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={saving || deleting}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving || deleting}
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden
                      />
                    ) : null}
                    {saving ? t('saving') : t('save')}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!deleting) setConfirmOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmT('title')}</DialogTitle>
            <DialogDescription>{confirmT('description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              {confirmT('abort')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {deleting ? t('deleting') : confirmT('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function ToggleRow({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          value ? 'bg-purple-700' : 'bg-input'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform',
            value ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
