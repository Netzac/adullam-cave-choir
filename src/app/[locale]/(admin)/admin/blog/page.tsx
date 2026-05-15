'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Loader2,
  Newspaper,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { BlogPost } from '@/types/database';

export default function AdminBlogPage() {
  const locale = useLocale();
  const t = useTranslations('adminBlog.list');
  const statusT = useTranslations('adminBlog.list.status');
  const actionsT = useTranslations('adminBlog.list.actions');
  const toggleSuccessT = useTranslations('adminBlog.list.toggleSuccess');
  const errorsT = useTranslations('adminBlog.list.errors');

  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load blog posts', error);
          setLoadError(errorsT('load'));
          setPosts([]);
        } else {
          setPosts((data ?? []) as BlogPost[]);
          setLoadError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [errorsT]);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) => {
      const hay = `${post.title} ${post.slug}`.toLowerCase();
      return hay.includes(term);
    });
  }, [posts, search]);

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeZone: 'Africa/Accra',
      }),
    [locale]
  );

  const handleTogglePublish = React.useCallback(
    async (post: BlogPost) => {
      if (pendingId) return;
      setPendingId(post.id);
      const nextPublished = !post.is_published;
      const nextPublishedAt = nextPublished
        ? (post.published_at ?? new Date().toISOString())
        : null;
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('blog_posts')
          .update({
            is_published: nextPublished,
            published_at: nextPublishedAt,
          })
          .eq('id', post.id);
        if (error) throw error;
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  is_published: nextPublished,
                  published_at: nextPublishedAt,
                }
              : p
          )
        );
        toast.success(
          nextPublished
            ? toggleSuccessT('published')
            : toggleSuccessT('unpublished')
        );
      } catch (err) {
        console.error('Failed to toggle publish state', err);
        toast.error(errorsT('toggle'));
      } finally {
        setPendingId(null);
      }
    },
    [pendingId, toggleSuccessT, errorsT]
  );

  const hasFilter = search.trim() !== '';

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
            {t('subtitle')}
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4" aria-hidden />
            {t('createCta')}
          </Link>
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="blog-search" className="sr-only">
                {t('search.label')}
              </Label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="blog-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('search.placeholder')}
                  className="pl-9"
                />
              </div>
            </div>
            {hasFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearch('')}
                className="gap-1.5 text-muted-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
                {t('reset')}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingState message={t('loading')} />
          ) : loadError ? (
            <ErrorState message={loadError} />
          ) : filtered.length === 0 ? (
            <EmptyState message={t('empty')} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.title')}</TableHead>
                    <TableHead className="w-32">{t('table.status')}</TableHead>
                    <TableHead className="w-40">
                      {t('table.publishedDate')}
                    </TableHead>
                    <TableHead className="w-56 text-right">
                      {t('table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((post) => {
                    const isPending = pendingId === post.id;
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="text-foreground hover:text-gold-600 hover:underline underline-offset-4"
                          >
                            {post.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            /{post.slug}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              post.is_published
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 bg-slate-50 text-slate-700'
                            )}
                          >
                            {post.is_published
                              ? statusT('published')
                              : statusT('draft')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {post.published_at
                            ? dateFmt.format(new Date(post.published_at))
                            : t('publishedAt')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              asChild
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              <Link href={`/admin/blog/${post.id}`}>
                                {actionsT('edit')}
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleTogglePublish(post)}
                              className="gap-1.5"
                            >
                              {isPending ? (
                                <Loader2
                                  className="h-3.5 w-3.5 animate-spin"
                                  aria-hidden
                                />
                              ) : post.is_published ? (
                                <EyeOff
                                  className="h-3.5 w-3.5"
                                  aria-hidden
                                />
                              ) : (
                                <Eye className="h-3.5 w-3.5" aria-hidden />
                              )}
                              {post.is_published
                                ? actionsT('unpublish')
                                : actionsT('publish')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-rose-700">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Newspaper className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
