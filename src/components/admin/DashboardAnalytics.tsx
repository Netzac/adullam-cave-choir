import { createClient } from '@/lib/supabase/server';
import {
  getApplicationsPerMonth,
  getDonationsOverTime,
  getEventAttendanceTrends,
  getPopularPrograms,
} from '@/lib/analytics/queries';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { placeholderEvents } from '@/lib/constants/placeholders';

export async function DashboardAnalytics() {
  try {
    const supabase = createClient();
    const [applicationsPerMonth, donationsOverTime, popularPrograms, eventAttendance] =
      await Promise.all([
        getApplicationsPerMonth(supabase),
        getDonationsOverTime(supabase),
        getPopularPrograms(supabase),
        getEventAttendanceTrends(supabase),
      ]);

    return (
      <AdminAnalytics
        applicationsPerMonth={applicationsPerMonth}
        donationsOverTime={donationsOverTime}
        popularPrograms={popularPrograms}
        eventAttendance={eventAttendance}
      />
    );
  } catch {
    return (
      <AdminAnalytics
        applicationsPerMonth={[]}
        donationsOverTime={[]}
        popularPrograms={[]}
        eventAttendance={placeholderEvents.map((e) => ({
          month: e.date.slice(0, 7),
          count: 1,
        }))}
      />
    );
  }
}
