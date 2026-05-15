import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url('Enter a valid URL')
  .optional()
  .or(z.literal(''));

const optionalEmail = z
  .string()
  .trim()
  .email('Enter a valid email')
  .optional()
  .or(z.literal(''));

export const generalSettingsSchema = z.object({
  site_name: z.string().trim().min(2, 'Site name is required').max(120),
  site_tagline: z.string().trim().min(2, 'Tagline is required').max(200),
  admin_notification_email: optionalEmail,
});

export const socialSettingsSchema = z.object({
  social_facebook_url: optionalUrl,
  social_instagram_url: optionalUrl,
  social_youtube_url: optionalUrl,
  social_tiktok_url: optionalUrl,
  social_x_url: optionalUrl,
  whatsapp_number: z.string().trim().max(30).optional().or(z.literal('')),
});

export const contactSettingsSchema = z.object({
  contact_address: z.string().trim().min(2, 'Address is required').max(500),
  contact_phone: z.string().trim().min(6, 'Phone is required').max(30),
  contact_email: optionalEmail,
  contact_maps_embed_url: optionalUrl,
});

export const contentSettingsSchema = z.object({
  content_about_intro: z.string().trim().max(8000).optional().or(z.literal('')),
  content_how_to_apply: z.string().trim().max(8000).optional().or(z.literal('')),
  content_homepage_tagline: z.string().trim().max(300).optional().or(z.literal('')),
});

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type SocialSettingsInput = z.infer<typeof socialSettingsSchema>;
export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;
export type ContentSettingsInput = z.infer<typeof contentSettingsSchema>;
