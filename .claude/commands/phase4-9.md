Project: Adullam Cave Choir. Read CLAUDE.md for full context.
Only work on notifications system.

1. Create src/hooks/useNotifications.ts:
   - Subscribe to Supabase Realtime on notifications table
   - Return: notifications list, unread count, markAsRead, markAllAsRead
   - Filter to only current admin's notifications

2. Update src/components/AdminLayout.tsx:
   - Import and use useNotifications hook
   - Show red badge on bell icon with unread count
   - Dropdown on bell click showing last 5 notifications
   - Each notification: icon, message, time ago, read/unread style
   - "Mark all as read" button in dropdown
   - "View All" link to /notifications

3. Create src/app/[locale]/(admin)/notifications/page.tsx:
   - Full list of all notifications
   - Mark as read on click
   - Mark All as Read button
   - Filter: All, Unread, Read
   - Notification types with different icons:
     new_application (blue), new_donation (green),
     new_contact (yellow), status_change (purple)
   - Real-time updates via Supabase Realtime

When done run npm run typecheck and fix any errors.