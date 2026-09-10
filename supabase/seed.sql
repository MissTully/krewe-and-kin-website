-- Demo seed for Krewe & Kin billing
-- After creating auth users in Supabase, link profiles/clients by updating profile_id / email.
-- For local demo without auth, DEMO_MODE=true uses in-app sample data instead.

-- Admin profile placeholder (replace id with real auth.users id after signup)
-- insert into public.profiles (id, email, full_name, role)
-- values ('00000000-0000-0000-0000-000000000001', 'missy@kreweandkin.com', 'Missy Tully', 'admin');

insert into public.clients (id, company_name, contact_name, email, phone, notes)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Bayou Brew Co.',
    'Alex Rivera',
    'alex@bayoubrew.example',
    '504-555-0142',
    'Website build + monthly retainer for content updates'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Garden District Florist',
    'Jordan Lee',
    'jordan@gdf.example',
    '504-555-0199',
    'One-time brochure site'
  )
on conflict (id) do nothing;

-- Website build: deposit + balance
insert into public.invoices (
  id, client_id, invoice_number, title, description, invoice_type, status,
  subtotal_cents, tax_cents, total_cents, amount_paid_cents, due_date, issued_at
) values
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'KK-2026-001',
  'Website build — deposit',
  '50% deposit for custom WordPress site',
  'deposit',
  'paid',
  250000, 0, 250000, 250000,
  '2026-08-01',
  '2026-07-15T15:00:00Z'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'KK-2026-002',
  'Website build — final balance',
  'Remaining 50% due at launch',
  'balance',
  'sent',
  250000, 0, 250000, 0,
  '2026-09-15',
  '2026-09-01T15:00:00Z'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'KK-2026-003',
  'Monthly retainer — September 2026',
  'Content updates, minor fixes, analytics review',
  'retainer',
  'sent',
  75000, 0, 75000, 0,
  '2026-09-05',
  '2026-09-01T12:00:00Z'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '22222222-2222-2222-2222-222222222222',
  'KK-2026-004',
  'Brochure website — one-time',
  '5-page brochure site with contact form',
  'one_time',
  'overdue',
  180000, 0, 180000, 0,
  '2026-08-20',
  '2026-08-01T12:00:00Z'
)
on conflict (id) do nothing;

insert into public.invoice_line_items (invoice_id, description, quantity, unit_amount_cents, amount_cents, sort_order)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Custom website design & build (50% deposit)', 1, 250000, 250000, 1),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Custom website design & build (final balance)', 1, 250000, 250000, 1),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Monthly retainer — content & support', 1, 75000, 75000, 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '5-page brochure website', 1, 150000, 150000, 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Contact form + basic SEO setup', 1, 30000, 30000, 2);

insert into public.payment_schedules (id, client_id, invoice_id, schedule_type, label, amount_cents, cadence, next_due_date, active)
values
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'deposit_balance',
    'Bayou Brew website — balance due',
    250000,
    null,
    '2026-09-15',
    true
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'retainer_monthly',
    'Bayou Brew monthly retainer',
    75000,
    'monthly',
    '2026-10-05',
    true
  )
on conflict (id) do nothing;

insert into public.payments (
  id, invoice_id, client_id, amount_cents, currency, status, provider,
  provider_order_id, provider_capture_id, paid_at
) values (
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  250000,
  'USD',
  'completed',
  'paypal',
  'DEMO-ORDER-DEPOSIT',
  'DEMO-CAPTURE-DEPOSIT',
  '2026-07-16T18:22:00Z'
)
on conflict (id) do nothing;
