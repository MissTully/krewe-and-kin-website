export type UserRole = "client" | "admin";

export type InvoiceType = "one_time" | "deposit" | "balance" | "retainer";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "void";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type ScheduleType = "deposit_balance" | "retainer_monthly";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  profile_id: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  invoice_number: string;
  title: string;
  description: string | null;
  invoice_type: InvoiceType;
  status: InvoiceStatus;
  currency: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  due_date: string | null;
  issued_at: string | null;
  paid_at: string | null;
  parent_invoice_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  client?: Client;
  line_items?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_amount_cents: number;
  amount_cents: number;
  sort_order: number;
  created_at: string;
}

export interface PaymentSchedule {
  id: string;
  client_id: string;
  invoice_id: string | null;
  schedule_type: ScheduleType;
  label: string;
  amount_cents: number;
  cadence: string | null;
  next_due_date: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  client_id: string;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  provider_order_id: string | null;
  provider_capture_id: string | null;
  provider_payload: Record<string, unknown>;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
