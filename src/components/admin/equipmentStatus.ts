import type { EquipmentStatus } from '@/types/database';

export const EQUIPMENT_STATUS_TONE: Record<EquipmentStatus, string> = {
  planned: 'border-slate-200 bg-slate-50 text-slate-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-800',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  maintenance: 'border-sky-200 bg-sky-50 text-sky-800',
};
