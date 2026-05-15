'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';

interface CancelEventDialogProps {
  eventId: string;
  /** Render-prop for the trigger button to keep the caller in control. */
  trigger?: React.ReactNode;
  onCancelled?: () => void;
  disabled?: boolean;
}

export function CancelEventDialog({
  eventId,
  trigger,
  onCancelled,
  disabled,
}: CancelEventDialogProps) {
  const t = useTranslations('adminEvents.detail.cancelEvent');
  const listT = useTranslations('adminEvents.list');
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const handleConfirm = async () => {
    if (pending) return;
    setPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId);
      if (error) throw error;
      toast.success(listT('cancelled'));
      setOpen(false);
      onCancelled?.();
      router.refresh();
    } catch (err) {
      console.error('Failed to cancel event', err);
      toast.error(listT('errors.cancel'));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1.5 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          >
            <XCircle className="h-4 w-4" aria-hidden />
            {t('trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            {t('abort')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
