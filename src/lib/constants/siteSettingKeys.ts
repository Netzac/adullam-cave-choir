/** Keys stored in `site_settings.key` (one row per field). */
export const SITE_SETTING_KEYS = {
  siteName: 'site_name',
  siteTagline: 'site_tagline',
  adminNotificationEmail: 'admin_notification_email',
  socialFacebookUrl: 'social_facebook_url',
  socialInstagramUrl: 'social_instagram_url',
  socialYoutubeUrl: 'social_youtube_url',
  socialTiktokUrl: 'social_tiktok_url',
  socialXUrl: 'social_x_url',
  whatsappNumber: 'whatsapp_number',
  contactAddress: 'contact_address',
  contactPhone: 'contact_phone',
  contactEmail: 'contact_email',
  contactMapsEmbedUrl: 'contact_maps_embed_url',
  contentAboutIntro: 'content_about_intro',
  contentHowToApply: 'content_how_to_apply',
  contentHomepageTagline: 'content_homepage_tagline',
} as const;

export type SiteSettingKey =
  (typeof SITE_SETTING_KEYS)[keyof typeof SITE_SETTING_KEYS];
