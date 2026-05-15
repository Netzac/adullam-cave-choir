'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import type { Application, ApplicationStatus } from '@/types/database';
import {
  APPLICATION_STATUS_TONE,
  EDITABLE_APPLICATION_STATUSES,
  formatApplicationDate,
} from './applicationStatus';
import { cn } from '@/lib/utils/cn';

interface ApplicationDetailDrawerProps {
  application: Application | null;
  open: boolean;
  locale: string;
  onClose: () => void;
  onSaved: (updated: Application) => void;
}

export function ApplicationDetailDrawer({
  application,
  open,
  locale,
  onClose,
  onSaved,
}: ApplicationDetailDrawerProps) {
  const t = useTranslations('adminApplications.drawer');
  const statusT = useTranslations('adminApplications.status');
  const fieldsT = useTranslations('adminApplications.drawer.fields');
  const consentT = useTranslations('adminApplications.drawer.consent');
  const sectionsT = useTranslations('adminApplications.drawer.sections');
  const applyFieldsT = useTranslations('apply.fields');
  const levelsT = useTranslations('apply.levels');

  const [status, setStatus] = React.useState<ApplicationStatus>('pending');
  const [internalNotes, setInternalNotes] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // Sync state when the selected application changes.
  React.useEffect(() => {
    if (application) {
      setStatus(application.status);
      setInternalNotes(application.internal_notes ?? '');
    }
  }, [application]);

  const isDirty = React.useMemo(() => {
    if (!application) return false;
    return (
      status !== application.status ||
      (internalNotes ?? '') !== (application.internal_notes ?? '')
    );
  }, [application, status, internalNotes]);

  const handleSave = React.useCallback(async () => {
    if (!application || saving) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          internal_notes: internalNotes.trim() ? internalNotes : null,
        })
        .eq('id', application.id)
        .select()
        .single();
      if (error) throw error;
      toast.success(t('saved'));
      onSaved(data as Application);
    } catch (err) {
      console.error('Failed to save application', err);
      toast.error(t('saveError'));
    } finally {
      setSaving(false);
    }
  }, [application, status, internalNotes, saving, onSaved, t]);

  // Map the DB status to the user-facing label.
  const statusLabel = React.useCallback(
    (value: ApplicationStatus): string => {
      const key: Record<ApplicationStatus, string> = {
        pending: 'received',
        reviewing: 'underReview',
        shortlisted: 'shortlisted',
        accepted: 'admitted',
        rejected: 'rejected',
        waitlisted: 'waitlisted',
      };
      return statusT(key[value]);
    },
    [statusT]
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {application ? (
          <>
            <SheetHeader className="space-y-1 border-b border-border/60 px-6 py-5 text-left">
              <SheetTitle className="font-serif text-xl">
                {application.full_name}
              </SheetTitle>
              <SheetDescription>
                {t('subtitle', {
                  date: formatApplicationDate(application.created_at, locale, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  }),
                })}
              </SheetDescription>
              <div className="pt-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                    APPLICATION_STATUS_TONE[application.status]
                  )}
                >
                  {statusLabel(application.status)}
                </span>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Photo + key identifiers */}
              <section className="flex items-start gap-4">
                <PhotoDisplay
                  url={application.passport_photo_url}
                  alt={application.full_name}
                  noPhotoLabel={t('noPhoto')}
                />
                <dl className="grid flex-1 grid-cols-1 gap-3 text-sm">
                  <Field
                    icon={Phone}
                    label={fieldsT('phone')}
                    value={application.phone}
                    href={`tel:${application.phone}`}
                  />
                  <Field
                    icon={Mail}
                    label={fieldsT('email')}
                    value={application.email || t('noValue')}
                    href={application.email ? `mailto:${application.email}` : undefined}
                  />
                  <Field
                    icon={User}
                    label={fieldsT('age')}
                    value={String(application.age)}
                  />
                </dl>
              </section>

              <Separator />

              {/* Program interest */}
              <section className="space-y-4">
                <SectionHeading>{sectionsT('program')}</SectionHeading>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadOnlyField
                    label={fieldsT('preferredProgram')}
                    value={application.preferred_program}
                  />
                  <ReadOnlyField
                    label={fieldsT('interestLevel')}
                    value={levelsT(application.interest_level)}
                  />
                </div>
                <ReadOnlyField
                  label={fieldsT('experience')}
                  value={application.experience}
                  multiline
                  emptyLabel={t('noValue')}
                />
              </section>

              <Separator />

              {/* Consent & applicant notes */}
              <section className="space-y-4">
                <SectionHeading>{sectionsT('consent')}</SectionHeading>
                <ReadOnlyField
                  label={fieldsT('guardianConsent')}
                  value={
                    application.guardian_consent
                      ? consentT('given')
                      : consentT('notGiven')
                  }
                />
                <ReadOnlyField
                  label={fieldsT('applicantNotes')}
                  value={application.notes}
                  multiline
                  emptyLabel={t('noValue')}
                />
              </section>

              <Separator />

              {/* Internal review */}
              <section className="space-y-4">
                <SectionHeading>{sectionsT('review')}</SectionHeading>

                <div className="grid gap-2">
                  <Label htmlFor="application-status">
                    {fieldsT('status')}
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as ApplicationStatus)
                    }
                  >
                    <SelectTrigger id="application-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EDITABLE_APPLICATION_STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {statusLabel(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="application-internal-notes">
                    {fieldsT('internalNotes')}
                  </Label>
                  <Textarea
                    id="application-internal-notes"
                    value={internalNotes}
                    onChange={(event) => setInternalNotes(event.target.value)}
                    placeholder={t('internalNotesPlaceholder')}
                    rows={5}
                  />
                </div>

                <dl className="grid grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
                  <div>
                    <dt className="font-medium uppercase tracking-wider">
                      {fieldsT('submittedAt')}
                    </dt>
                    <dd className="mt-0.5 text-foreground">
                      {formatApplicationDate(application.created_at, locale, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </dd>
                  </div>
                  {application.updated_at &&
                  application.updated_at !== application.created_at ? (
                    <div>
                      <dt className="font-medium uppercase tracking-wider">
                        {fieldsT('updatedAt')}
                      </dt>
                      <dd className="mt-0.5 text-foreground">
                        {formatApplicationDate(application.updated_at, locale, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              {/* Hidden field name keeps the apply.fields key alive for now */}
              <span className="sr-only">
                {applyFieldsT('passportPhoto')}
              </span>
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-border/60 bg-background/95 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={saving}
              >
                {t('close')}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {saving ? t('saving') : t('save')}
              </Button>
            </footer>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small presentational helpers
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h3>
  );
}

function PhotoDisplay({
  url,
  alt,
  noPhotoLabel,
}: {
  url: string | null;
  alt: string;
  noPhotoLabel: string;
}) {
  if (!url) {
    return (
      <div
        aria-label={noPhotoLabel}
        className="flex h-24 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground"
      >
        {noPhotoLabel}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external URL, dynamic
    <img
      src={url}
      alt={alt}
      className="h-24 w-20 shrink-0 rounded-md border border-border object-cover"
    />
  );
}

function Field({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="truncate text-sm text-foreground">
          {href ? (
            <a
              href={href}
              className="hover:text-gold-600 hover:underline underline-offset-4"
            >
              {value}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  multiline = false,
  emptyLabel,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
  emptyLabel?: string;
}) {
  const display = value && value.trim() ? value : emptyLabel ?? '—';
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'text-sm text-foreground',
          multiline && 'whitespace-pre-wrap leading-relaxed'
        )}
      >
        {display}
      </p>
    </div>
  );
}
