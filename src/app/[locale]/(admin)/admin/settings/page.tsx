'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { siteConfig } from '@/config/site';
import {
  settingToString,
  getAllAsMap,
  upsertMany,
} from '@/lib/supabase/queries/siteSettings';
import {
  generalSettingsSchema,
  socialSettingsSchema,
  contactSettingsSchema,
  contentSettingsSchema,
  type GeneralSettingsInput,
  type SocialSettingsInput,
  type ContactSettingsInput,
  type ContentSettingsInput,
} from '@/lib/validations/siteSettingsSchema';

type GeneralFormInput = z.input<typeof generalSettingsSchema>;
type SocialFormInput = z.input<typeof socialSettingsSchema>;
type ContactFormInput = z.input<typeof contactSettingsSchema>;
type ContentFormInput = z.input<typeof contentSettingsSchema>;

const defaultAddress = [
  siteConfig.contact.address.line1,
  siteConfig.contact.address.line2,
  siteConfig.contact.address.country,
]
  .filter(Boolean)
  .join(', ');

function socialDefault(name: (typeof siteConfig.social)[number]['name']): string {
  return siteConfig.social.find((link) => link.name === name)?.href ?? '';
}

export default function AdminSettingsPage() {
  const t = useTranslations('adminSettings');
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const generalForm = useForm<GeneralFormInput, unknown, GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    mode: 'onTouched',
    defaultValues: {
      site_name: siteConfig.name,
      site_tagline: siteConfig.tagline,
      admin_notification_email: siteConfig.contact.email,
    },
  });

  const socialForm = useForm<SocialFormInput, unknown, SocialSettingsInput>({
    resolver: zodResolver(socialSettingsSchema),
    mode: 'onTouched',
    defaultValues: {
      social_facebook_url: socialDefault('facebook'),
      social_instagram_url: socialDefault('instagram'),
      social_youtube_url: socialDefault('youtube'),
      social_tiktok_url: socialDefault('tiktok'),
      social_x_url: socialDefault('x'),
      whatsapp_number: siteConfig.contact.whatsapp,
    },
  });

  const contactForm = useForm<ContactFormInput, unknown, ContactSettingsInput>({
    resolver: zodResolver(contactSettingsSchema),
    mode: 'onTouched',
    defaultValues: {
      contact_address: defaultAddress,
      contact_phone: siteConfig.contact.phone,
      contact_email: siteConfig.contact.email,
      contact_maps_embed_url: '',
    },
  });

  const contentForm = useForm<ContentFormInput, unknown, ContentSettingsInput>({
    resolver: zodResolver(contentSettingsSchema),
    mode: 'onTouched',
    defaultValues: {
      content_about_intro: '',
      content_how_to_apply: '',
      content_homepage_tagline: '',
    },
  });

  const applyMapToForms = React.useCallback(
    (map: Record<string, unknown>) => {
      generalForm.reset({
        site_name: settingToString(map, 'site_name', siteConfig.name),
        site_tagline: settingToString(map, 'site_tagline', siteConfig.tagline),
        admin_notification_email: settingToString(
          map,
          'admin_notification_email',
          siteConfig.contact.email
        ),
      });
      socialForm.reset({
        social_facebook_url: settingToString(
          map,
          'social_facebook_url',
          socialDefault('facebook')
        ),
        social_instagram_url: settingToString(
          map,
          'social_instagram_url',
          socialDefault('instagram')
        ),
        social_youtube_url: settingToString(
          map,
          'social_youtube_url',
          socialDefault('youtube')
        ),
        social_tiktok_url: settingToString(
          map,
          'social_tiktok_url',
          socialDefault('tiktok')
        ),
        social_x_url: settingToString(map, 'social_x_url', socialDefault('x')),
        whatsapp_number: settingToString(
          map,
          'whatsapp_number',
          siteConfig.contact.whatsapp
        ),
      });
      contactForm.reset({
        contact_address: settingToString(map, 'contact_address', defaultAddress),
        contact_phone: settingToString(map, 'contact_phone', siteConfig.contact.phone),
        contact_email: settingToString(map, 'contact_email', siteConfig.contact.email),
        contact_maps_embed_url: settingToString(map, 'contact_maps_embed_url', ''),
      });
      contentForm.reset({
        content_about_intro: settingToString(map, 'content_about_intro', ''),
        content_how_to_apply: settingToString(map, 'content_how_to_apply', ''),
        content_homepage_tagline: settingToString(
          map,
          'content_homepage_tagline',
          ''
        ),
      });
    },
    [generalForm, socialForm, contactForm, contentForm]
  );

  React.useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    setLoading(true);

    getAllAsMap(supabase)
      .then((map) => {
        if (cancelled) return;
        applyMapToForms(map);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load site settings', err);
        setLoadError(t('errors.load'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applyMapToForms, t]);

  const saveTab = React.useCallback(
    async (entries: Record<string, unknown>, tabLabel: string) => {
      try {
        const supabase = createClient();
        await upsertMany(supabase, entries);
        toast.success(t('success', { tab: tabLabel }));
      } catch (err) {
        console.error('Failed to save settings', err);
        toast.error(t('errors.save', { tab: tabLabel }));
      }
    },
    [t]
  );

  const onSaveGeneral = async (data: GeneralSettingsInput) => {
    await saveTab(
      {
        site_name: data.site_name,
        site_tagline: data.site_tagline,
        admin_notification_email: data.admin_notification_email ?? '',
      },
      t('tabs.general')
    );
  };

  const onSaveSocial = async (data: SocialSettingsInput) => {
    await saveTab(
      {
        social_facebook_url: data.social_facebook_url ?? '',
        social_instagram_url: data.social_instagram_url ?? '',
        social_youtube_url: data.social_youtube_url ?? '',
        social_tiktok_url: data.social_tiktok_url ?? '',
        social_x_url: data.social_x_url ?? '',
        whatsapp_number: data.whatsapp_number ?? '',
      },
      t('tabs.social')
    );
  };

  const onSaveContact = async (data: ContactSettingsInput) => {
    await saveTab(
      {
        contact_address: data.contact_address,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email ?? '',
        contact_maps_embed_url: data.contact_maps_embed_url ?? '',
      },
      t('tabs.contact')
    );
  };

  const onSaveContent = async (data: ContentSettingsInput) => {
    await saveTab(
      {
        content_about_intro: data.content_about_intro ?? '',
        content_how_to_apply: data.content_how_to_apply ?? '',
        content_homepage_tagline: data.content_homepage_tagline ?? '',
      },
      t('tabs.content')
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        <span>{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
          {t('subtitle')}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t('title')}
        </h1>
      </header>

      {loadError ? (
        <p className="text-sm text-rose-700">{loadError}</p>
      ) : null}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          <TabsTrigger value="social">{t('tabs.social')}</TabsTrigger>
          <TabsTrigger value="contact">{t('tabs.contact')}</TabsTrigger>
          <TabsTrigger value="content">{t('tabs.content')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsTabCard
            title={t('general.title')}
            description={t('general.description')}
          >
            <TabForm
              form={generalForm}
              onSubmit={onSaveGeneral}
              submitLabel={t('save')}
              savingLabel={t('saving')}
            >
              <FieldGroup
                label={t('general.fields.siteName')}
                error={generalForm.formState.errors.site_name?.message}
              >
                <Input
                  id="settings-site-name"
                  {...generalForm.register('site_name')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('general.fields.tagline')}
                error={generalForm.formState.errors.site_tagline?.message}
              >
                <Input
                  id="settings-tagline"
                  {...generalForm.register('site_tagline')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('general.fields.adminEmail')}
                hint={t('general.fields.adminEmailHint')}
                error={
                  generalForm.formState.errors.admin_notification_email?.message
                }
              >
                <Input
                  id="settings-admin-email"
                  type="email"
                  autoComplete="email"
                  {...generalForm.register('admin_notification_email')}
                />
              </FieldGroup>
            </TabForm>
          </SettingsTabCard>
        </TabsContent>

        <TabsContent value="social">
          <SettingsTabCard
            title={t('social.title')}
            description={t('social.description')}
          >
            <TabForm
              form={socialForm}
              onSubmit={onSaveSocial}
              submitLabel={t('save')}
              savingLabel={t('saving')}
            >
              <FieldGroup
                label={t('social.fields.facebook')}
                error={socialForm.formState.errors.social_facebook_url?.message}
              >
                <Input
                  type="url"
                  placeholder="https://facebook.com/…"
                  {...socialForm.register('social_facebook_url')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('social.fields.instagram')}
                error={socialForm.formState.errors.social_instagram_url?.message}
              >
                <Input
                  type="url"
                  placeholder="https://instagram.com/…"
                  {...socialForm.register('social_instagram_url')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('social.fields.youtube')}
                error={socialForm.formState.errors.social_youtube_url?.message}
              >
                <Input
                  type="url"
                  placeholder="https://youtube.com/…"
                  {...socialForm.register('social_youtube_url')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('social.fields.tiktok')}
                error={socialForm.formState.errors.social_tiktok_url?.message}
              >
                <Input
                  type="url"
                  placeholder="https://tiktok.com/…"
                  {...socialForm.register('social_tiktok_url')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('social.fields.x')}
                error={socialForm.formState.errors.social_x_url?.message}
              >
                <Input
                  type="url"
                  placeholder="https://x.com/…"
                  {...socialForm.register('social_x_url')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('social.fields.whatsapp')}
                hint={t('social.fields.whatsappHint')}
                error={socialForm.formState.errors.whatsapp_number?.message}
              >
                <Input
                  type="tel"
                  placeholder="+233…"
                  {...socialForm.register('whatsapp_number')}
                />
              </FieldGroup>
            </TabForm>
          </SettingsTabCard>
        </TabsContent>

        <TabsContent value="contact">
          <SettingsTabCard
            title={t('contact.title')}
            description={t('contact.description')}
          >
            <TabForm
              form={contactForm}
              onSubmit={onSaveContact}
              submitLabel={t('save')}
              savingLabel={t('saving')}
            >
              <FieldGroup
                label={t('contact.fields.address')}
                error={contactForm.formState.errors.contact_address?.message}
              >
                <Textarea
                  id="settings-address"
                  rows={3}
                  {...contactForm.register('contact_address')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('contact.fields.phone')}
                error={contactForm.formState.errors.contact_phone?.message}
              >
                <Input type="tel" {...contactForm.register('contact_phone')} />
              </FieldGroup>
              <FieldGroup
                label={t('contact.fields.email')}
                error={contactForm.formState.errors.contact_email?.message}
              >
                <Input
                  type="email"
                  {...contactForm.register('contact_email')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('contact.fields.mapsEmbed')}
                hint={t('contact.fields.mapsEmbedHint')}
                error={
                  contactForm.formState.errors.contact_maps_embed_url?.message
                }
              >
                <Input
                  type="url"
                  placeholder="https://www.google.com/maps/embed?…"
                  {...contactForm.register('contact_maps_embed_url')}
                />
              </FieldGroup>
            </TabForm>
          </SettingsTabCard>
        </TabsContent>

        <TabsContent value="content">
          <SettingsTabCard
            title={t('content.title')}
            description={t('content.description')}
          >
            <TabForm
              form={contentForm}
              onSubmit={onSaveContent}
              submitLabel={t('save')}
              savingLabel={t('saving')}
            >
              <FieldGroup
                label={t('content.fields.aboutIntro')}
                error={contentForm.formState.errors.content_about_intro?.message}
              >
                <Textarea
                  rows={6}
                  {...contentForm.register('content_about_intro')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('content.fields.howToApply')}
                error={contentForm.formState.errors.content_how_to_apply?.message}
              >
                <Textarea
                  rows={6}
                  {...contentForm.register('content_how_to_apply')}
                />
              </FieldGroup>
              <FieldGroup
                label={t('content.fields.homepageTagline')}
                hint={t('content.fields.homepageTaglineHint')}
                error={
                  contentForm.formState.errors.content_homepage_tagline?.message
                }
              >
                <Input {...contentForm.register('content_homepage_tagline')} />
              </FieldGroup>
            </TabForm>
          </SettingsTabCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsTabCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-6 p-5 sm:p-8">
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function TabForm<T extends Record<string, unknown>>({
  form,
  onSubmit,
  submitLabel,
  savingLabel,
  children,
}: {
  form: {
    handleSubmit: (
      onValid: (data: T) => void | Promise<void>
    ) => (event?: React.BaseSyntheticEvent) => Promise<void>;
    formState: { isSubmitting: boolean };
  };
  onSubmit: (data: T) => void | Promise<void>;
  submitLabel: string;
  savingLabel: string;
  children: React.ReactNode;
}) {
  const submitting = form.formState.isSubmitting;
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {children}
      <div className="flex justify-end border-t border-border/60 pt-5">
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {submitting ? savingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FieldGroup({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
