'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHero } from '@/components/sections/PageHero';
import { contactSchema, type ContactInput } from '@/lib/validations/contactSchema';
import { siteConfig } from '@/config/site';

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
} as const;

export function ContactView() {
  const hero = useTranslations('contactPage.hero');
  const nav = useTranslations('nav');
  const form = useTranslations('contactPage.form');
  const info = useTranslations('contactPage.info');
  const applyBox = useTranslations('contactPage.applyBox');
  const contact = useTranslations('contact');

  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const rhf = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactInput) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      setSent(true);
      rhf.reset();
      toast.success(form('success'));
    } catch {
      toast.error(form('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={hero('eyebrow')}
        title={hero('title')}
        subtitle={hero('subtitle')}
        breadcrumb={[
          { label: nav('home'), href: '/' },
          { label: nav('contact') },
        ]}
      />

      <section className="container py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-border/60 bg-card p-8 shadow-soft md:p-10"
          >
            <h2 className="font-serif text-2xl font-bold md:text-3xl">{form('title')}</h2>

            {sent ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <p>{form('success')}</p>
              </div>
            ) : null}

            <form onSubmit={rhf.handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field error={rhf.formState.errors.full_name?.message}>
                  <Label htmlFor="full_name">{form('fullName')}</Label>
                  <Input id="full_name" autoComplete="name" {...rhf.register('full_name')} />
                </Field>
                <Field error={rhf.formState.errors.email?.message}>
                  <Label htmlFor="email">{form('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...rhf.register('email')}
                  />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field error={rhf.formState.errors.phone?.message}>
                  <Label htmlFor="phone">{form('phone')}</Label>
                  <Input id="phone" type="tel" autoComplete="tel" {...rhf.register('phone')} />
                </Field>
                <Field error={rhf.formState.errors.subject?.message}>
                  <Label htmlFor="subject">{form('subject')}</Label>
                  <Input id="subject" {...rhf.register('subject')} />
                </Field>
              </div>
              <Field error={rhf.formState.errors.message?.message}>
                <Label htmlFor="message">{form('message')}</Label>
                <Textarea id="message" rows={6} {...rhf.register('message')} />
              </Field>

              <Button type="submit" disabled={submitting} className="group">
                {submitting ? form('sending') : form('submit')}
                <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft md:p-8"
            >
              <h3 className="font-serif text-xl font-bold">{info('title')}</h3>

              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      {info('emailLabel')}
                    </div>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="font-medium hover:text-primary"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      {info('phoneLabel')}
                    </div>
                    <a
                      href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                      className="font-medium hover:text-primary"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      {info('addressLabel')}
                    </div>
                    <p className="font-medium">
                      {siteConfig.contact.address.line1}
                      <br />
                      {siteConfig.contact.address.line2},{' '}
                      {siteConfig.contact.address.country}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {contact('followUs')}
                </span>
                <div className="flex items-center gap-2">
                  {siteConfig.social
                    .filter((s) => s.name in socialIcons)
                    .map((s) => {
                      const Icon = socialIcons[s.name as keyof typeof socialIcons];
                      return (
                        <a
                          key={s.name}
                          href={s.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={s.label}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="aspect-video overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft"
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-dark text-white/70">
                <div className="text-center">
                  <MapPin className="mx-auto h-10 w-10 text-gold-300" />
                  <p className="mt-3 text-sm">Map placeholder · Accra, Ghana</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-6 shadow-soft md:p-8"
            >
              <h3 className="font-serif text-lg font-bold">{applyBox('title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{applyBox('body')}</p>
              <Button asChild variant="outline" className="mt-4 group">
                <Link href="/apply">
                  {applyBox('cta')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
