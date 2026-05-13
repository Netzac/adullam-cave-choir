Activate Phase 3 features for Adullam Cave Choir. These build on the completed Phase 1 and Phase 2:

1. PAYSTACK FULL INTEGRATION
   - Complete payment flow for workshop fees
   - Donation processing with Paystack Popup
   - Payment verification webhook at /api/webhooks/paystack
   - Update donation/event_application status on successful payment
   - Send payment confirmation emails

2. ADVANCED ANALYTICS (Admin Dashboard)
   - Applications per month chart (Recharts)
   - Donations over time chart
   - Most popular programs
   - Event attendance trends
   - Export reports as CSV

3. ROLE-BASED ACCESS CONTROL
   - Add roles table: super_admin, content_manager, workshop_coordinator
   - Update RLS policies per role
   - Update admin UI to show/hide features based on role
   - Admin can assign roles to other admins

4. WORKFLOW REMINDERS
   - Cron job (Vercel Cron): daily check for applications pending > 7 days
   - Send reminder email to admin
   - Event reminder: WhatsApp message to admitted participants 24hrs before event

5. WHATSAPP AUTOMATION
   - Full Twilio WhatsApp flow for application lifecycle
   - Event reminders via WhatsApp
   - Bulk WhatsApp message to admitted members (admin triggered)

6. RICH TEXT EDITOR
   - Replace textarea in blog editor with Tiptap
   - Support: headings, bold, italic, lists, links, images
   - Used in blog posts and program descriptions

7. MEMBER PORTAL (Optional)
   - Admitted applicants can be given a portal login
   - View their application status
   - See upcoming events they're admitted to
   - Download any resources shared by admin

Final commit: "feat: complete Phase 3 advanced features"