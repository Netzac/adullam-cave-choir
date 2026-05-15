'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
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
  EVENT_STATUS_VALUES,
  eventSchema,
  type EventInput,
} from '@/lib/validations/eventSchema';
import type { ChoirEvent, EventStatus } from '@/types/database';
import { cn } from '@/lib/utils/cn';

type EventFormInput = z.input<typeof eventSchema>;

interface EventFormProps {
  mode: 'create' | 'edit';
  event?: ChoirEvent;
}

export function EventForm({ mode, event }: EventFormProps) {
  const t = useTranslations('adminEvents.form');
  const dbStatusT = useTranslations('adminEvents.dbStatus');
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const defaults = React.useMemo<EventFormInput>(
    () => ({
      title: event?.title ?? '',
      description: event?.description ?? '',
      audience: event?.audience ?? '',
      date: event?.date ?? '',
      time: event ? toFormTime(event.time) : '',
      venue: event?.venue ?? '',
      capacity: event?.capacity ?? ('' as unknown as number),
      fee: event?.fee ?? 0,
      currency: event?.currency ?? 'GHS',
      is_online: event?.is_online ?? false,
      status: event?.status ?? 'draft',
    }),
    [event]
  );

  const form = useForm<EventFormInput, unknown, EventInput>({
    resolver: zodResolver(eventSchema),
    mode: 'onTouched',
    defaultValues: defaults,
  });

  React.useEffect(() => {
    form.reset(defaults);
  }, [defaults, form]);

  const onSubmit = async (data: EventInput) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        title: data.title,
        description: data.description,
        audience: data.audience,
        date: data.date,
        time: toDbTime(data.time),
        venue: data.venue,
        capacity: data.capacity,
        fee: data.fee,
        currency: data.currency,
        is_online: data.is_online,
        status: data.status,
      };

      if (mode === 'edit' && event) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', event.id);
        if (error) throw error;
        toast.success(t('successUpdate'));
        router.refresh();
      } else {
        // The generated Insert type omits `status` (DB has a default), but we
        // need to set the chosen status on creation. Split the work: insert
        // the row without status, then patch the status if it differs from
        // the DB default.
        const { status, ...insertable } = payload;
        const { data: inserted, error: insertError } = await supabase
          .from('events')
          .insert(insertable)
          .select('id')
          .single();
        if (insertError) throw insertError;
        if (status !== 'draft' && inserted?.id) {
          const { error: updateError } = await supabase
            .from('events')
            .update({ status })
            .eq('id', inserted.id);
          if (updateError) throw updateError;
        }
        toast.success(t('successCreate'));
        router.push('/admin/events');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to save event', err);
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
        <FieldGroup className="sm:col-span-2" error={errors.title?.message}>
          <Label htmlFor="event-title">{t('fields.title')}</Label>
          <Input
            id="event-title"
            placeholder={t('placeholders.title')}
            autoComplete="off"
            {...form.register('title')}
          />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.description?.message}>
          <Label htmlFor="event-description">{t('fields.description')}</Label>
          <Textarea
            id="event-description"
            placeholder={t('placeholders.description')}
            rows={5}
            {...form.register('description')}
          />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.audience?.message}>
          <Label htmlFor="event-audience">{t('fields.audience')}</Label>
          <Input
            id="event-audience"
            placeholder={t('placeholders.audience')}
            {...form.register('audience')}
          />
        </FieldGroup>

        <FieldGroup error={errors.date?.message}>
          <Label htmlFor="event-date">{t('fields.date')}</Label>
          <Input id="event-date" type="date" {...form.register('date')} />
        </FieldGroup>

        <FieldGroup error={errors.time?.message}>
          <Label htmlFor="event-time">{t('fields.time')}</Label>
          <Input id="event-time" type="time" {...form.register('time')} />
        </FieldGroup>

        <FieldGroup className="sm:col-span-2" error={errors.venue?.message}>
          <Label htmlFor="event-venue">{t('fields.venue')}</Label>
          <Input
            id="event-venue"
            placeholder={t('placeholders.venue')}
            {...form.register('venue')}
          />
        </FieldGroup>

        <FieldGroup error={errors.capacity?.message}>
          <Label htmlFor="event-capacity">{t('fields.capacity')}</Label>
          <Input
            id="event-capacity"
            type="number"
            min={1}
            step={1}
            placeholder={t('placeholders.capacity')}
            {...form.register('capacity')}
          />
        </FieldGroup>

        <FieldGroup error={errors.fee?.message}>
          <Label htmlFor="event-fee">{t('fields.fee')}</Label>
          <Input
            id="event-fee"
            type="number"
            min={0}
            step="0.01"
            {...form.register('fee')}
          />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="event-is-online">{t('fields.isOnline')}</Label>
          <OnlineToggle
            id="event-is-online"
            value={!!form.watch('is_online')}
            onChange={(next) =>
              form.setValue('is_online', next, { shouldDirty: true })
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('fields.isOnlineHint')}
          </p>
        </FieldGroup>

        <FieldGroup error={errors.status?.message}>
          <Label htmlFor="event-status">{t('fields.status')}</Label>
          <Select
            value={form.watch('status') ?? 'draft'}
            onValueChange={(value) =>
              form.setValue('status', value as EventStatus, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="event-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {dbStatusT(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/admin/events')}
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

function OnlineToggle({
  id,
  value,
  onChange,
}: {
  id: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
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
  );
}

/** Trim a DB time (HH:MM:SS) to a form-friendly HH:MM. */
function toFormTime(value: string): string {
  if (!value) return '';
  return value.length >= 5 ? value.slice(0, 5) : value;
}

/** Pad a form HH:MM to DB HH:MM:SS. */
function toDbTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value;
}
