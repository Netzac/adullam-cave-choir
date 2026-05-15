'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
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
import type { BlogPost } from '@/types/database';
import { BlogPostForm } from '@/components/admin/BlogPostForm';

export default function AdminEditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const router = useRouter();
  const t = useTranslations('adminBlog.form');
  const detailT = useTranslations('adminBlog.detail');
  const deleteT = useTranslations('adminBlog.detail.delete');

  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Failed to load blog post', error);
          setLoadError(detailT('loadError'));
        } else {
          setPost((data as BlogPost | null) ?? null);
          setLoadError(null);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, detailT]);

  const handleDelete = React.useCallback(async () => {
    if (!post || deleting) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);
      if (error) throw error;
      toast.success(deleteT('success'));
      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      console.error('Failed to delete blog post', err);
      toast.error(deleteT('error'));
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }, [post, deleting, deleteT, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>{detailT('loading')}</span>
      </div>
    );
  }

  if (loadError || !post) {
    return (
      <div className="space-y-6">
        <Button
          asChild
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-3 gap-1.5 text-muted-foreground"
        >
          <Link href="/admin/blog">
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
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('back')}
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('editTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('editSubtitle')}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="gap-1.5 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {deleteT('trigger')}
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="p-5 sm:p-8">
          <BlogPostForm mode="edit" post={post} />
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!deleting) setConfirmOpen(next);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteT('title')}</DialogTitle>
            <DialogDescription>{deleteT('description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              {deleteT('abort')}
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
              {deleteT('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
