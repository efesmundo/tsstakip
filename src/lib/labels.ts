import type {
  FeeType,
  PaymentStatus,
  ServicePriority,
  ServiceStatus,
  TeamType,
} from "@/lib/supabase/types";

export const statusLabels: Record<ServiceStatus, string> = {
  pending: "Bekliyor",
  in_progress: "Devam Ediyor",
  awaiting_approval: "Onay Bekliyor",
  approved: "Onaylandı",
  completed: "Tamamlandı",
  canceled: "İptal",
  rejected: "Reddedildi",
};

export const priorityLabels: Record<ServicePriority, string> = {
  urgent: "Acil",
  high: "Yüksek",
  normal: "Normal",
  low: "Düşük",
};

export const feeLabels: Record<FeeType, string> = {
  free: "Ücretsiz",
  paid: "Ücretli",
  warranty: "Garanti",
};

export const teamLabels: Record<TeamType, string> = {
  technical_team: "Teknik Ekip",
  subcontractor: "Taşeron",
};

export const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  partial: "Kısmi",
};

export function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrency(amount: number | null, currency: string) {
  if (amount === null) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amount);
}
