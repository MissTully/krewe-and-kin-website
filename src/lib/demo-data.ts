import type {
  Client,
  Invoice,
  InvoiceLineItem,
  Payment,
  PaymentSchedule,
  Profile,
} from "./types";

export const DEMO_ADMIN: Profile = {
  id: "demo-admin",
  email: "missy@kreweandkin.com",
  full_name: "Missy Tully",
  role: "admin",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export const DEMO_CLIENT_PROFILE: Profile = {
  id: "demo-client-user",
  email: "alex@bayoubrew.example",
  full_name: "Alex Rivera",
  role: "client",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

export const DEMO_CLIENTS: Client[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    profile_id: "demo-client-user",
    company_name: "Bayou Brew Co.",
    contact_name: "Alex Rivera",
    email: "alex@bayoubrew.example",
    phone: "504-555-0142",
    notes: "Website build + monthly retainer",
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    profile_id: null,
    company_name: "Garden District Florist",
    contact_name: "Jordan Lee",
    email: "jordan@gdf.example",
    phone: "504-555-0199",
    notes: "One-time brochure site",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
];

export const DEMO_LINE_ITEMS: InvoiceLineItem[] = [
  {
    id: "li-1",
    invoice_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    description: "Custom website design & build (50% deposit)",
    quantity: 1,
    unit_amount_cents: 250000,
    amount_cents: 250000,
    sort_order: 1,
    created_at: "2026-07-15T00:00:00Z",
  },
  {
    id: "li-2",
    invoice_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    description: "Custom website design & build (final balance)",
    quantity: 1,
    unit_amount_cents: 250000,
    amount_cents: 250000,
    sort_order: 1,
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "li-3",
    invoice_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    description: "Monthly retainer — content & support",
    quantity: 1,
    unit_amount_cents: 75000,
    amount_cents: 75000,
    sort_order: 1,
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "li-4",
    invoice_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    description: "5-page brochure website",
    quantity: 1,
    unit_amount_cents: 150000,
    amount_cents: 150000,
    sort_order: 1,
    created_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "li-5",
    invoice_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    description: "Contact form + basic SEO setup",
    quantity: 1,
    unit_amount_cents: 30000,
    amount_cents: 30000,
    sort_order: 2,
    created_at: "2026-08-01T00:00:00Z",
  },
];

export const DEMO_INVOICES: Invoice[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    client_id: "11111111-1111-1111-1111-111111111111",
    invoice_number: "KK-2026-001",
    title: "Website build — deposit",
    description: "50% deposit for custom WordPress site",
    invoice_type: "deposit",
    status: "paid",
    currency: "USD",
    subtotal_cents: 250000,
    tax_cents: 0,
    total_cents: 250000,
    amount_paid_cents: 250000,
    due_date: "2026-08-01",
    issued_at: "2026-07-15T15:00:00Z",
    paid_at: "2026-07-16T18:22:00Z",
    parent_invoice_id: null,
    metadata: {},
    created_at: "2026-07-15T15:00:00Z",
    updated_at: "2026-07-16T18:22:00Z",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    client_id: "11111111-1111-1111-1111-111111111111",
    invoice_number: "KK-2026-002",
    title: "Website build — final balance",
    description: "Remaining 50% due at launch",
    invoice_type: "balance",
    status: "sent",
    currency: "USD",
    subtotal_cents: 250000,
    tax_cents: 0,
    total_cents: 250000,
    amount_paid_cents: 0,
    due_date: "2026-09-15",
    issued_at: "2026-09-01T15:00:00Z",
    paid_at: null,
    parent_invoice_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    metadata: {},
    created_at: "2026-09-01T15:00:00Z",
    updated_at: "2026-09-01T15:00:00Z",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    client_id: "11111111-1111-1111-1111-111111111111",
    invoice_number: "KK-2026-003",
    title: "Monthly retainer — September 2026",
    description: "Content updates, minor fixes, analytics review",
    invoice_type: "retainer",
    status: "sent",
    currency: "USD",
    subtotal_cents: 75000,
    tax_cents: 0,
    total_cents: 75000,
    amount_paid_cents: 0,
    due_date: "2026-09-05",
    issued_at: "2026-09-01T12:00:00Z",
    paid_at: null,
    parent_invoice_id: null,
    metadata: {},
    created_at: "2026-09-01T12:00:00Z",
    updated_at: "2026-09-01T12:00:00Z",
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    client_id: "22222222-2222-2222-2222-222222222222",
    invoice_number: "KK-2026-004",
    title: "Brochure website — one-time",
    description: "5-page brochure site with contact form",
    invoice_type: "one_time",
    status: "overdue",
    currency: "USD",
    subtotal_cents: 180000,
    tax_cents: 0,
    total_cents: 180000,
    amount_paid_cents: 0,
    due_date: "2026-08-20",
    issued_at: "2026-08-01T12:00:00Z",
    paid_at: null,
    parent_invoice_id: null,
    metadata: {},
    created_at: "2026-08-01T12:00:00Z",
    updated_at: "2026-08-01T12:00:00Z",
  },
];

export const DEMO_SCHEDULES: PaymentSchedule[] = [
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    client_id: "11111111-1111-1111-1111-111111111111",
    invoice_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    schedule_type: "deposit_balance",
    label: "Bayou Brew website — balance due",
    amount_cents: 250000,
    cadence: null,
    next_due_date: "2026-09-15",
    active: true,
    metadata: {},
    created_at: "2026-07-15T00:00:00Z",
    updated_at: "2026-07-15T00:00:00Z",
  },
  {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    client_id: "11111111-1111-1111-1111-111111111111",
    invoice_id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    schedule_type: "retainer_monthly",
    label: "Bayou Brew monthly retainer",
    amount_cents: 75000,
    cadence: "monthly",
    next_due_date: "2026-10-05",
    active: true,
    metadata: {},
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
];

export const DEMO_PAYMENTS: Payment[] = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    invoice_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    client_id: "11111111-1111-1111-1111-111111111111",
    amount_cents: 250000,
    currency: "USD",
    status: "completed",
    provider: "paypal",
    provider_order_id: "DEMO-ORDER-DEPOSIT",
    provider_capture_id: "DEMO-CAPTURE-DEPOSIT",
    provider_payload: {},
    paid_at: "2026-07-16T18:22:00Z",
    created_at: "2026-07-16T18:22:00Z",
    updated_at: "2026-07-16T18:22:00Z",
  },
];

export function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")
  );
}

export function getDemoInvoice(id: string): Invoice | undefined {
  const invoice = DEMO_INVOICES.find((i) => i.id === id);
  if (!invoice) return undefined;
  const client = DEMO_CLIENTS.find((c) => c.id === invoice.client_id);
  const line_items = DEMO_LINE_ITEMS.filter((li) => li.invoice_id === id).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  return { ...invoice, client, line_items };
}

export function getDemoInvoicesForClient(clientId?: string): Invoice[] {
  const list = clientId
    ? DEMO_INVOICES.filter((i) => i.client_id === clientId)
    : DEMO_INVOICES;
  return list.map((invoice) => ({
    ...invoice,
    client: DEMO_CLIENTS.find((c) => c.id === invoice.client_id),
    line_items: DEMO_LINE_ITEMS.filter((li) => li.invoice_id === invoice.id),
  }));
}
