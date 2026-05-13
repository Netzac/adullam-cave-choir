Implement the full notification system for Adullam Cave Choir:

## Email with Resend
1. Create src/lib/email/templates/ with React Email templates:
   - ApplicationReceived.tsx — sent to applicant on submission
   - NewApplicationAlert.tsx — sent to admin when new application arrives
   - ApplicationStatusUpdate.tsx — sent to applicant when status changes
   - EventApplicationReceived.tsx — for workshop applications
   - ContactFormAlert.tsx — admin alert for contact form submissions
   - DonationConfirmation.tsx — donor receipt

2. All templates must:
   - Use Adullam Cave Choir branding (purple/gold)
   - Include the logo and tagline
   - Be mobile responsive
   - Have English and French versions

3. Create src/lib/email/send.ts — wrapper functions for sending each email type

## WhatsApp with Twilio
4. Create src/lib/whatsapp/send.ts with functions:
   - sendApplicationConfirmation(phone, name) — to applicant
   - sendAdminAlert(message) — to admin WhatsApp number
   - sendStatusUpdate(phone, name, status) — when application status changes

5. WhatsApp message templates (must match Twilio approved templates):
   - Application received confirmation
   - Application status update
   - Event reminder (24hrs before)

## In-App Notifications
6. Create src/hooks/useNotifications.ts:
   - Subscribe to Supabase Realtime on notifications table
   - Return unread count and notification list
   - markAsRead function

7. Update AdminLayout notification bell to use this hook:
   - Show red badge with unread count
   - Dropdown showing last 5 notifications
   - Click to mark as read
   - "View All" link to /admin/notifications

## Trigger Notifications
8. Update these API routes to trigger full notification chain:
   - POST /api/applications → save to DB + email applicant + email admin + WhatsApp admin + create in-app notification
   - POST /api/contact → email admin + create in-app notification
   - POST /api/donations → email donor + email admin + create in-app notification
   - Admin status change → email applicant + WhatsApp applicant

Show me all created files when done.