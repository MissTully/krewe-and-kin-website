import {
  DEMO_CLIENTS,
  DEMO_SCHEDULES,
  getDemoInvoice,
  getDemoInvoicesForClient,
  isDemoMode,
} from "./demo-data";
import type { Client, Invoice, InvoiceStatus, PaymentSchedule } from "./types";
import { getSessionUser } from "./auth";

export async function listInvoicesForCurrentUser(): Promise<Invoice[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (isDemoMode()) {
    if (user.profile.role === "admin") {
      return getDemoInvoicesForClient();
    }
    const client = DEMO_CLIENTS.find((c) => c.profile_id === user.id);
    return getDemoInvoicesForClient(client?.id);
  }

  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();

  if (user.profile.role === "admin") {
    const { data } = await supabase
      .from("invoices")
      .select("*, client:clients(*)")
      .order("created_at", { ascending: false });
    return (data || []) as Invoice[];
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .eq("profile_id", user.id);

  const ids = (clients || []).map((c) => c.id);
  if (!ids.length) return [];

  const { data } = await supabase
    .from("invoices")
    .select("*, client:clients(*)")
    .in("client_id", ids)
    .order("created_at", { ascending: false });

  return (data || []) as Invoice[];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (isDemoMode()) {
    return getDemoInvoice(id) || null;
  }

  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, client:clients(*), line_items:invoice_line_items(*)")
    .eq("id", id)
    .single();

  if (!data) return null;
  const invoice = data as Invoice;
  if (invoice.line_items) {
    invoice.line_items = [...invoice.line_items].sort(
      (a, b) => a.sort_order - b.sort_order
    );
  }
  return invoice;
}

export async function listClients(): Promise<Client[]> {
  if (isDemoMode()) return DEMO_CLIENTS;

  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("company_name");
  return (data || []) as Client[];
}

export async function listSchedules(): Promise<PaymentSchedule[]> {
  if (isDemoMode()) return DEMO_SCHEDULES;

  const { createClient } = await import("./supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("payment_schedules")
    .select("*")
    .eq("active", true)
    .order("next_due_date");
  return (data || []) as PaymentSchedule[];
}

export async function markInvoicePaid(params: {
  invoiceId: string;
  amountCents: number;
  orderId: string;
  captureId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  if (isDemoMode()) {
    const inv = getDemoInvoice(params.invoiceId);
    if (inv) {
      inv.status = "paid" as InvoiceStatus;
      inv.amount_paid_cents = inv.total_cents;
      inv.paid_at = new Date().toISOString();
    }
    return;
  }

  const { createServiceClient } = await import("./supabase/server");
  const supabase = await createServiceClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.invoiceId)
    .single();

  if (!invoice) throw new Error("Invoice not found");

  await supabase.from("payments").insert({
    invoice_id: params.invoiceId,
    client_id: invoice.client_id,
    amount_cents: params.amountCents,
    currency: invoice.currency,
    status: "completed",
    provider: "paypal",
    provider_order_id: params.orderId,
    provider_capture_id: params.captureId || null,
    provider_payload: params.payload || {},
    paid_at: new Date().toISOString(),
  });

  const paid = (invoice.amount_paid_cents || 0) + params.amountCents;
  const status: InvoiceStatus =
    paid >= invoice.total_cents ? "paid" : "partial";

  await supabase
    .from("invoices")
    .update({
      amount_paid_cents: paid,
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", params.invoiceId);
}
