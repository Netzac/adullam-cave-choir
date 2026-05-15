'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  blogPostSchema,
  type BlogPostInput,
} from '@/lib/validations/blogPostSchema';
import type { BlogPost } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { slugify } from '@/lib/utils/slugify';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

type BlogFormInput = z.input<typeof blogPostSchema>;

interface BlogPostFormProps {
  mode: 'create' | 'edit';
  post?: BlogPost;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function BlogPostForm({ mode, post }: BlogPostFormProps) {
  const t = useTranslations('adminBlog.form');
  const fieldsT = useTranslations('adminBlog.form.fields');
  const placeholdersT = useTranslations('adminBlog.form.placeholders');
  const coverT = useTranslations('adminBlog.form.cover');
  const router = useRouter();

  const [submitting, setSubmitting] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(
    post?.cover_image_url ?? null
  );

  const defaults = React.useMemo<BlogFormInput>(
    () => ({
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      content: post?.content ?? '',
      excerpt: post?.excerpt ?? '',
      cover_image_url: post?.cover_image_url ?? '',
      is_published: post?.is_published ?? false,
      published_at: post?.published_at ?? '',
      author_id: post?.author_id ?? '',
    }),
    [post]
  );

  const form = useForm<BlogFormInput, unknown, BlogPostInput>({
    resolver: zodResolver(blogPostSchema),
    mode: 'onTouched',
    defaultValues: defaults,
  });

  // Keep slug in sync with the title until the user edits the slug field.
  const slugTouched = React.useRef<boolean>(mode === 'edit');
  const watchedTitle = form.watch('title');

  React.useEffect(() => {
    if (slugTouched.current) return;
    if (!watchedTitle) return;
    const next = slugify(watchedTitle);
    form.setValue('slug', next, { shouldValidate: false });
  }, [watchedTitle, form]);

  // File preview lifecycle.
  React.useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const acceptFile = React.useCallback((next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(next.type)) {
      toast.error(coverT('hint'));
      return;
    }
    if (next.size > MAX_FILE_BYTES) {
      toast.error(coverT('hint'));
      return;
    }
    setFile(next);
  }, [coverT]);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    acceptFile(event.dataTransfer?.files?.[0] ?? null);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragActive) setDragActive(true);
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0] ?? null);
  };

  const onSubmit = async (data: BlogPostInput) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      let finalCoverUrl: string | null = coverUrl;

      // Upload cover image if a new one was picked.
      if (file) {
        const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
        const path = `blog/${new Date().getFullYear()}/${cryptoRandomId()}.${ext}`;
        const upload = await supabase.storage
          .from('gallery')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });
        if (upload.error) {
          toast.error(t('uploadError'));
          throw upload.error;
        }
        const { data: publicData } = supabase.storage
          .from('gallery')
          .getPublicUrl(upload.data.path);
        finalCoverUrl = publicData.publicUrl;
      }

      const excerpt =
        typeof data.excerpt === 'string' && data.excerpt.trim()
          ? data.excerpt.trim()
          : null;

      const publishedAt = data.is_published
        ? (post?.published_at && post.is_published
            ? post.published_at
            : new Date().toISOString())
        : null;

      const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt,
        cover_image_url: finalCoverUrl,
        is_published: data.is_published,
        published_at: publishedAt,
      };

      if (mode === 'edit' && post) {
        const { error } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', post.id);
        if (error) throw error;
        toast.success(t('successUpdate'));
        setCoverUrl(finalCoverUrl);
        setFile(null);
        router.refresh();
      } else {
        // The generated Insert type omits `is_published` (DB default). Insert
        // without it, then patch if needed.
        const { is_published, published_at, ...insertable } = payload;
        const { data: inserted, error: insertError } = await supabase
          .from('blog_posts')
          .insert(insertable)
          .select('id')
          .single();
        if (insertError) throw insertError;
        if ((is_published || published_at) && inserted?.id) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ is_published, published_at })
            .eq('id', inserted.id);
          if (updateError) throw updateError;
        }
        toast.success(t('successCreate'));
        router.push('/admin/blog');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to save blog post', err);
      toast.error(t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  const errors = form.formState.errors;
  const previewSrc = filePreview ?? coverUrl;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldGroup className="sm:col-span-2" error={errors.title?.message}>
          <Label htmlFor="blog-title">{fieldsT('title')}</Label>
          <Input
            id="blog-title"
            placeholder={placeholdersT('title')}
            autoComplete="off"
            {...form.register('title')}
          />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.slug?.message}>
          <Label htmlFor="blog-slug">{fieldsT('slug')}</Label>
          <Input
            id="blog-slug"
            placeholder={placeholdersT('slug')}
            autoComplete="off"
            {...form.register('slug', {
              onChange: () => {
                slugTouched.current = true;
              },
            })}
          />
          <p className="text-xs text-muted-foreground">{fieldsT('slugHint')}</p>
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.excerpt?.message}>
          <Label htmlFor="blog-excerpt">{fieldsT('excerpt')}</Label>
          <Textarea
            id="blog-excerpt"
            rows={2}
            placeholder={placeholdersT('excerpt')}
            {...form.register('excerpt')}
          />
          <p className="text-xs text-muted-foreground">
            {fieldsT('excerptHint')}
          </p>
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.content?.message}>
          <Label htmlFor="blog-content">{fieldsT('content')}</Label>
          <Controller
            control={form.control}
            name="content"
            render={({ field }) => (
              <RichTextEditor
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder={placeholdersT('content')}
              />
            )}
          />
        </FieldGroup>

        <div className="space-y-2 sm:col-span-2">
          <Label>{fieldsT('coverImage')}</Label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => setDragActive(false)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors',
              dragActive
                ? 'border-purple-700 bg-purple-50'
                : 'border-border bg-muted/30'
            )}
          >
            {previewSrc ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- preview */}
                <img
                  src={previewSrc}
                  alt=""
                  className="max-h-48 w-auto rounded-lg border border-border object-contain shadow-sm"
                />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      {coverT('replace')}
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
                    onClick={() => {
                      setFile(null);
                      setCoverUrl(null);
                    }}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <X className="h-4 w-4" aria-hidden />
                    {coverT('remove')}
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
                  {dragActive ? coverT('active') : coverT('idle')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {coverT('hint')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2 gap-1.5"
                >
                  <label className="cursor-pointer">
                    <ImagePlus className="h-4 w-4" aria-hidden />
                    {coverT('replace')}
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
        </div>

        <ToggleRow
          id="blog-published"
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
          onClick={() => router.push('/admin/blog')}
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-3 sm:col-span-2">
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

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
