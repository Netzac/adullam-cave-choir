'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  CheckSquare,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Play,
  Plus,
  Search,
  Square,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { GalleryItem } from '@/types/database';
import { GalleryItemEditDialog } from '@/components/admin/GalleryItemEditDialog';
import {
  CATEGORY_TONE,
  GALLERY_FILTER_VALUES,
  type GalleryFilterValue,
  categoryMatchesFilter,
  pickThumbnail,
} from '@/components/admin/galleryHelpers';

export default function AdminGalleryPage() {
  const locale = useLocale();
  const t = useTranslations('adminGallery.list');
  const categoriesT = useTranslations('adminGallery.list.categories');
  const labelsT = useTranslations('adminGallery.list.labels');
  const bulkT = useTranslations('adminGallery.list.bulk');
  const cardT = useTranslations('adminGallery.list.card');
  const categoryLabelT = useTranslations('adminGallery.categoryLabel');

  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [filter, setFilter] = React.useState<GalleryFilterValue>('all');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const [editing, setEditing] = React.useState<GalleryItem | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const [bulkPending, setBulkPending] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  // Load items.
  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);
    supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load gallery items', error);
          setLoadError(error.message);
          setItems([]);
        } else {
          setItems((data ?? []) as GalleryItem[]);
          setLoadError(null);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!categoryMatchesFilter(item.category, filter)) return false;
      if (term && !item.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [items, filter, search]);

  // Drop selected ids that are no longer visible.
  React.useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(filtered.map((i) => i.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (visible.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [filtered]);

  const toggleSelected = React.useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelected(new Set());
  }, []);

  const allSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  const toggleSelectAll = React.useCallback(() => {
    setSelected((prev) => {
      if (filtered.length > 0 && filtered.every((i) => prev.has(i.id))) {
        return new Set();
      }
      const next = new Set(prev);
      filtered.forEach((i) => next.add(i.id));
      return next;
    });
  }, [filtered]);

  const handleEditOpen = React.useCallback((item: GalleryItem) => {
    setEditing(item);
    setEditOpen(true);
  }, []);

  const handleEditUpdated = React.useCallback((updated: GalleryItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  }, []);

  const handleEditDeleted = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleBulkPublish = React.useCallback(
    async (publish: boolean) => {
      if (selected.size === 0 || bulkPending) return;
      setBulkPending(true);
      const ids = Array.from(selected);
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('gallery_items')
          .update({ is_published: publish })
          .in('id', ids);
        if (error) throw error;
        setItems((prev) =>
          prev.map((item) =>
            selected.has(item.id) ? { ...item, is_published: publish } : item
          )
        );
        toast.success(bulkT('publishedCount', { count: ids.length }));
      } catch (err) {
        console.error('Bulk publish failed', err);
        toast.error(t('errors.bulk'));
      } finally {
        setBulkPending(false);
      }
    },
    [selected, bulkPending, bulkT, t]
  );

  const handleBulkDelete = React.useCallback(async () => {
    if (selected.size === 0 || bulkPending) return;
    setBulkPending(true);
    const ids = Array.from(selected);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .in('id', ids);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => !selected.has(item.id)));
      toast.success(bulkT('deletedCount', { count: ids.length }));
      setSelected(new Set());
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error('Bulk delete failed', err);
      toast.error(t('errors.delete'));
    } finally {
      setBulkPending(false);
    }
  }, [selected, bulkPending, bulkT, t]);

  const dateFmt = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeZone: 'Africa/Accra',
      }),
    [locale]
  );

  const selectedCount = selected.size;

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
          <Link href="/admin/gallery/upload">
            <Plus className="h-4 w-4" aria-hidden />
            {t('uploadCta')}
          </Link>
        </Button>
      </header>

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {GALLERY_FILTER_VALUES.map((value) => {
                const active = filter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                      active
                        ? 'border-purple-700 bg-purple-700 text-white'
                        : 'border-border bg-background text-foreground/80 hover:bg-muted/60'
                    )}
                    aria-pressed={active}
                  >
                    {categoriesT(value)}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('search.placeholder')}
                aria-label={t('search.label')}
                className="pl-9"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-muted/60"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-purple-700" aria-hidden />
                ) : (
                  <Square className="h-4 w-4" aria-hidden />
                )}
                <span>{bulkT('selectAll')}</span>
              </button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedCount > 0 ? (
        <div
          role="region"
          aria-label="Bulk actions"
          className="sticky top-2 z-20 flex flex-col gap-3 rounded-lg border border-purple-200 bg-purple-50/95 px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-medium text-purple-900">
            {bulkT('selected', { count: selectedCount })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBulkPublish(true)}
              disabled={bulkPending}
              className="gap-1.5"
            >
              <Eye className="h-4 w-4" aria-hidden />
              {bulkT('publish')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBulkPublish(false)}
              disabled={bulkPending}
              className="gap-1.5"
            >
              <EyeOff className="h-4 w-4" aria-hidden />
              {bulkT('unpublish')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={bulkPending}
              className="gap-1.5 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              {bulkT('delete')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={bulkPending}
              className="gap-1.5 text-muted-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
              {bulkT('clear')}
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <LoadingState />
      ) : loadError ? (
        <ErrorState message={loadError} />
      ) : filtered.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const isSelected = selected.has(item.id);
            const thumbnail = pickThumbnail(item);
            const isVideo = item.media_type !== 'image';
            return (
              <article
                key={item.id}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft transition-all',
                  isSelected
                    ? 'border-purple-700 ring-2 ring-purple-500/30'
                    : 'border-border/60 hover:border-border'
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element -- external URL, dynamic
                    <img
                      src={thumbnail}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10" aria-hidden />
                    </div>
                  )}

                  {isVideo ? (
                    <span
                      aria-label={labelsT('video')}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <Play className="h-4 w-4" aria-hidden />
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => toggleSelected(item.id)}
                    aria-pressed={isSelected}
                    aria-label={cardT('selectLabel', { title: item.title })}
                    className={cn(
                      'absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm transition-all',
                      isSelected
                        ? 'border-purple-700 bg-purple-700 text-white'
                        : 'border-white/80 bg-white/85 text-foreground/70 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
                    )}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4" aria-hidden />
                    ) : (
                      <Square className="h-4 w-4" aria-hidden />
                    )}
                  </button>

                  {item.is_featured ? (
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-semibold text-purple-950 shadow-sm">
                      <Star className="h-3 w-3" aria-hidden />
                      {labelsT('featured')}
                    </span>
                  ) : null}

                  <span
                    className={cn(
                      'absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold shadow-sm',
                      item.is_published
                        ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
                        : 'border-slate-200 bg-slate-50/95 text-slate-700'
                    )}
                  >
                    {item.is_published ? (
                      <Eye className="h-3 w-3" aria-hidden />
                    ) : (
                      <EyeOff className="h-3 w-3" aria-hidden />
                    )}
                    {item.is_published
                      ? labelsT('published')
                      : labelsT('draft')}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3">
                  <h2 className="line-clamp-1 text-sm font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                        CATEGORY_TONE[item.category]
                      )}
                    >
                      {categoryLabelT(item.category)}
                    </span>
                    {item.date_taken ? (
                      <span className="text-[11px] text-muted-foreground">
                        {dateFmt.format(new Date(item.date_taken))}
                      </span>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOpen(item)}
                    aria-label={cardT('editLabel', { title: item.title })}
                    className="mt-1 gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <GalleryItemEditDialog
        item={editing}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={handleEditUpdated}
        onDeleted={handleEditDeleted}
      />

      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={(next) => {
          if (!bulkPending) setConfirmDeleteOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bulkT('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription>
              {bulkT('confirmDeleteBody', { count: selectedCount })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDeleteOpen(false)}
              disabled={bulkPending}
            >
              {bulkT('abort')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkPending}
              className="gap-2"
            >
              {bulkPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {bulkT('confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// State helpers
// ─────────────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      <span>Loading…</span>
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
        <ImageIcon className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
