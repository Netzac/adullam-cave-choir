'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  UploadCloud,
  X,
  Youtube,
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { GalleryCategory, MediaType } from '@/types/database';
import { z } from 'zod';
import {
  GALLERY_CATEGORY_VALUES,
  galleryItemMetaSchema,
  parseEmbedUrl,
  type GalleryItemMetaInput,
} from '@/lib/validations/gallerySchema';

type MetaFormInput = z.input<typeof galleryItemMetaSchema>;

type Source = 'image' | 'embed';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function AdminGalleryUploadPage() {
  const t = useTranslations('adminGallery.upload');
  const fieldsT = useTranslations('adminGallery.upload.fields');
  const errorsT = useTranslations('adminGallery.upload.errors');
  const placeholdersT = useTranslations('adminGallery.upload.placeholders');
  const dropzoneT = useTranslations('adminGallery.upload.dropzone');
  const embedT = useTranslations('adminGallery.upload.embed');
  const categoryT = useTranslations('adminGallery.categoryLabel');
  const router = useRouter();

  const [source, setSource] = React.useState<Source>('image');
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const [embedUrl, setEmbedUrl] = React.useState('');
  const embedInfo = React.useMemo(
    () => (embedUrl ? parseEmbedUrl(embedUrl) : null),
    [embedUrl]
  );

  const [submitting, setSubmitting] = React.useState(false);

  // Manage file preview lifecycle.
  React.useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const form = useForm<MetaFormInput, unknown, GalleryItemMetaInput>({
    resolver: zodResolver(galleryItemMetaSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      category: 'performances',
      date_taken: '',
      is_featured: false,
      is_published: true,
    },
  });

  const acceptFile = React.useCallback(
    (next: File | null) => {
      if (!next) {
        setFile(null);
        return;
      }
      if (!ALLOWED_TYPES.includes(next.type)) {
        toast.error(errorsT('invalidFileType'));
        return;
      }
      if (next.size > MAX_FILE_BYTES) {
        toast.error(errorsT('tooLarge'));
        return;
      }
      setFile(next);
    },
    [errorsT]
  );

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      const next = event.dataTransfer?.files?.[0] ?? null;
      acceptFile(next);
    },
    [acceptFile]
  );

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragActive) setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    acceptFile(next);
  };

  const onSubmit = async (data: GalleryItemMetaInput) => {
    if (submitting) return;

    // Validate media source first so the user gets a clear message.
    if (source === 'image' && !file) {
      toast.error(errorsT('noMedia'));
      return;
    }
    if (source === 'embed' && !embedInfo) {
      toast.error(errorsT('noMedia'));
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();

      let mediaType: MediaType = 'image';
      let fileUrl: string | null = null;
      let thumbnailUrl: string | null = null;
      let youtubeUrl: string | null = null;

      if (source === 'image' && file) {
        const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
        const path = `${new Date().getFullYear()}/${cryptoRandomId()}.${ext}`;
        const upload = await supabase.storage
          .from('gallery')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });
        if (upload.error) throw upload.error;
        const { data: publicData } = supabase.storage
          .from('gallery')
          .getPublicUrl(upload.data.path);
        fileUrl = publicData.publicUrl;
        thumbnailUrl = publicData.publicUrl;
        mediaType = 'image';
      } else if (source === 'embed' && embedInfo) {
        mediaType = embedInfo.mediaType;
        youtubeUrl = embedInfo.embedUrl;
        thumbnailUrl = embedInfo.thumbnailUrl;
      }

      const insert = await supabase.from('gallery_items').insert({
        title: data.title,
        description: data.description,
        category: data.category,
        media_type: mediaType,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        youtube_url: youtubeUrl,
        date_taken: data.date_taken,
      });
      if (insert.error) throw insert.error;

      // is_featured + is_published are omitted from the Insert type (DB default).
      // Patch them if they differ from defaults.
      if (data.is_featured || !data.is_published) {
        // We need the inserted row id; re-fetch the most recent matching row.
        const { data: latest } = await supabase
          .from('gallery_items')
          .select('id')
          .eq('title', data.title)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latest?.id) {
          await supabase
            .from('gallery_items')
            .update({
              is_featured: data.is_featured,
              is_published: data.is_published,
            })
            .eq('id', latest.id);
        }
      }

      toast.success(t('success'));
      router.push('/admin/gallery');
      router.refresh();
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : '';
      console.error('Failed to save gallery item', err);
      toast.error(
        message.toLowerCase().includes('storage')
          ? errorsT('uploadFailed')
          : errorsT('saveFailed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;

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
          <Link href="/admin/gallery">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('back')}
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </header>

      <Card>
        <CardContent className="p-5 sm:p-8">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Source switcher */}
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">
                {t('sourceLabel')}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <SourceTile
                  active={source === 'image'}
                  icon={ImagePlus}
                  label={t('sources.image')}
                  onClick={() => setSource('image')}
                />
                <SourceTile
                  active={source === 'embed'}
                  icon={Youtube}
                  label={t('sources.embed')}
                  onClick={() => setSource('embed')}
                />
              </div>
            </fieldset>

            {source === 'image' ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                  dragActive
                    ? 'border-purple-700 bg-purple-50'
                    : 'border-border bg-muted/30'
                )}
              >
                {filePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- preview blob */}
                    <img
                      src={filePreview}
                      alt={file?.name ?? ''}
                      className="max-h-48 w-auto rounded-lg border border-border object-contain shadow-sm"
                    />
                    <p className="text-sm font-medium text-foreground">
                      {dropzoneT('selected', { name: file?.name ?? '' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          {dropzoneT('replace')}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={onFileInputChange}
                          />
                        </label>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="gap-1.5 text-muted-foreground"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Clear
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud
                      className="h-10 w-10 text-muted-foreground"
                      aria-hidden
                    />
                    <p className="text-sm font-medium text-foreground">
                      {dragActive ? dropzoneT('active') : dropzoneT('idle')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dropzoneT('hint')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      asChild
                      className="mt-2"
                    >
                      <label className="cursor-pointer">
                        Choose file
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={onFileInputChange}
                        />
                      </label>
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gallery-embed-url">{embedT('label')}</Label>
                  <Input
                    id="gallery-embed-url"
                    type="url"
                    placeholder={embedT('placeholder')}
                    value={embedUrl}
                    onChange={(event) => setEmbedUrl(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {embedT('hint')}
                  </p>
                </div>
                {embedUrl && !embedInfo ? (
                  <p
                    role="alert"
                    className="text-xs font-medium text-rose-700"
                  >
                    {embedT('invalid')}
                  </p>
                ) : null}
                {embedInfo?.thumbnailUrl ? (
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {embedT('preview')}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element -- external thumbnail */}
                    <img
                      src={embedInfo.thumbnailUrl}
                      alt=""
                      className="max-h-44 rounded-lg border border-border object-contain"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Metadata fields */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldGroup className="sm:col-span-2" error={errors.title?.message}>
                <Label htmlFor="gallery-title">{fieldsT('title')}</Label>
                <Input
                  id="gallery-title"
                  placeholder={placeholdersT('title')}
                  autoComplete="off"
                  {...form.register('title')}
                />
              </FieldGroup>

              <FieldGroup
                className="sm:col-span-2"
                error={errors.description?.message}
              >
                <Label htmlFor="gallery-description">
                  {fieldsT('description')}
                </Label>
                <Textarea
                  id="gallery-description"
                  rows={4}
                  placeholder={placeholdersT('description')}
                  {...form.register('description')}
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="gallery-category">{fieldsT('category')}</Label>
                <Select
                  value={form.watch('category') ?? 'performances'}
                  onValueChange={(value) =>
                    form.setValue('category', value as GalleryCategory, {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger id="gallery-category">
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
              </FieldGroup>

              <FieldGroup error={errors.date_taken?.message}>
                <Label htmlFor="gallery-date">{fieldsT('dateTaken')}</Label>
                <Input
                  id="gallery-date"
                  type="date"
                  {...form.register('date_taken')}
                />
              </FieldGroup>

              <ToggleRow
                id="gallery-featured"
                label={fieldsT('isFeatured')}
                hint={fieldsT('isFeaturedHint')}
                value={!!form.watch('is_featured')}
                onChange={(next) =>
                  form.setValue('is_featured', next, { shouldDirty: true })
                }
              />
              <ToggleRow
                id="gallery-published"
                label={fieldsT('isPublished')}
                hint={fieldsT('isPublishedHint')}
                value={!!form.watch('is_published')}
                onChange={(next) =>
                  form.setValue('is_published', next, { shouldDirty: true })
                }
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/admin/gallery')}
                disabled={submitting}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {submitting ? t('submitting') : t('submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function SourceTile({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
        active
          ? 'border-purple-700 bg-purple-50 text-purple-900'
          : 'border-border bg-background hover:bg-muted/60'
      )}
    >
      <span
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-md',
          active ? 'bg-purple-700 text-white' : 'bg-muted text-muted-foreground'
        )}
        aria-hidden
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
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

function ToggleRow({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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

/** Tiny random id for storage paths. */
function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
