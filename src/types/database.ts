export type UserRole = 'super_admin' | 'admin' | 'editor';

export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'accepted'
  | 'rejected'
  | 'waitlisted';

export type EventStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';

export type EventApplicationStatus =
  | 'pending'
  | 'confirmed'
  | 'attended'
  | 'cancelled'
  | 'declined';

export type ProgramAudience = 'youth' | 'adult' | 'all';

export type ProgramFormat = 'in_person' | 'online' | 'hybrid';

export type MediaType = 'image' | 'video' | 'youtube' | 'vimeo';

export type GalleryCategory =
  | 'performances'
  | 'rehearsals'
  | 'workshops'
  | 'equipment'
  | 'events'
  | 'community';

export type EquipmentStatus = 'planned' | 'in_progress' | 'completed' | 'maintenance';

export type DonationStatus = 'initiated' | 'success' | 'failed' | 'refunded';

export type NotificationType =
  | 'application'
  | 'event_application'
  | 'donation'
  | 'contact'
  | 'system';

export type RelatedEntity =
  | 'application'
  | 'event_application'
  | 'donation'
  | 'equipment_record'
  | 'blog_post';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export type Application = {
  id: string;
  full_name: string;
  age: number;
  phone: string;
  email: string | null;
  interest_level: 'beginner' | 'intermediate' | 'advanced';
  experience: string | null;
  preferred_program: string;
  guardian_consent: boolean;
  notes: string | null;
  passport_photo_url: string | null;
  status: ApplicationStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type Program = {
  id: string;
  title: string;
  description: string;
  target_audience: ProgramAudience;
  duration: string;
  format: ProgramFormat;
  prerequisites: string | null;
  is_active: boolean;
  created_at: string;
}

export type ChoirEvent = {
  id: string;
  title: string;
  description: string;
  audience: string;
  date: string;
  time: string;
  venue: string;
  capacity: number | null;
  fee: number;
  currency: string;
  is_online: boolean;
  status: EventStatus;
  created_at: string;
}

export type EventApplication = {
  id: string;
  event_id: string;
  full_name: string;
  organization: string | null;
  email: string;
  phone: string;
  message: string | null;
  status: EventApplicationStatus;
  created_at: string;
}

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: GalleryCategory;
  media_type: MediaType;
  file_url: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  date_taken: string | null;
  created_at: string;
}

export type EquipmentRecord = {
  id: string;
  church_name: string;
  location: string;
  service_date: string;
  equipment_types: string[];
  notes: string | null;
  status: EquipmentStatus;
  created_at: string;
}

export type EquipmentGalleryLink = {
  id: string;
  equipment_record_id: string;
  gallery_item_id: string;
}

export type Donation = {
  id: string;
  donor_name: string | null;
  email: string | null;
  phone: string | null;
  amount: number;
  currency: string;
  message: string | null;
  payment_reference: string;
  status: DonationStatus;
  created_at: string;
}

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
}

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  related_id: string | null;
  related_type: RelatedEntity | null;
  created_at: string;
}

export type SiteSetting = {
  id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

type Insert<T, K extends keyof T = never> = Omit<T, 'id' | 'created_at' | 'updated_at' | K> &
  Partial<Pick<T, Extract<keyof T, 'id' | 'created_at' | 'updated_at'>>>;

type Update<T> = Partial<Insert<T>>;

export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insert<Profile>;
        Update: Update<Profile>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Insert<Application, 'status' | 'internal_notes'>;
        Update: Update<Application>;
        Relationships: [];
      };
      programs: {
        Row: Program;
        Insert: Insert<Program, 'is_active'>;
        Update: Update<Program>;
        Relationships: [];
      };
      events: {
        Row: ChoirEvent;
        Insert: Insert<ChoirEvent, 'status'>;
        Update: Update<ChoirEvent>;
        Relationships: [];
      };
      event_applications: {
        Row: EventApplication;
        Insert: Insert<EventApplication, 'status'>;
        Update: Update<EventApplication>;
        Relationships: [];
      };
      gallery_items: {
        Row: GalleryItem;
        Insert: Insert<GalleryItem, 'is_featured' | 'is_published'>;
        Update: Update<GalleryItem>;
        Relationships: [];
      };
      equipment_records: {
        Row: EquipmentRecord;
        Insert: Insert<EquipmentRecord, 'status'>;
        Update: Update<EquipmentRecord>;
        Relationships: [];
      };
      equipment_gallery: {
        Row: EquipmentGalleryLink;
        Insert: Insert<EquipmentGalleryLink>;
        Update: Update<EquipmentGalleryLink>;
        Relationships: [];
      };
      donations: {
        Row: Donation;
        Insert: Insert<Donation, 'status'>;
        Update: Update<Donation>;
        Relationships: [];
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Insert<BlogPost, 'is_published'>;
        Update: Update<BlogPost>;
        Relationships: [];
      };
      notifications: {
        Row: AppNotification;
        Insert: Insert<AppNotification, 'is_read'>;
        Update: Update<AppNotification>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Insert<SiteSetting>;
        Update: Update<SiteSetting>;
        Relationships: [];
      };
    };
  };
};

export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
