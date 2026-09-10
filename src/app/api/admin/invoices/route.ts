import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/auth";
import {
  DEMO_INVOICES,
  DEMO_LINE_ITEMS,
  DEMO_SCHEDULES,
  isDemoMode,
} from "@/lib/demo-data";
import type { Invoice, InvoiceLineItem, InvoiceType, PaymentSchedule } from "@/lib/types";

function nextInvoiceNumber(existing: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `KK-${year}-`;
  const nums = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    mode?: "one_time" | "deposit_balance" | "retainer";
    client_id?: string;
    title?: string;
    description?: string;
    amount_cents?: number;
    deposit_percent?: number;
    due_date?: string | null;
    line_description?: string;
  };

  if (!body.mode || !body.client_id || !body.title || !body.amount_cents) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const amount = body.amount_cents;
  const lineDesc = body.line_description || body.title;
  const now = new Date().toISOString();

  if (isDemoMode()) {
    const existingNums = DEMO_INVOICES.map((i) => i.invoice_number);

    const makeInvoice = (
      type: InvoiceType,
      title: string,
      cents: number,
      parentId: string | null = null
    ): Invoice => {
      const id = randomUUID();
      const invoice: Invoice = {
        id,
        client_id: body.client_id!,
        invoice_number: nextInvoiceNumber([
          ...existingNums,
          ...DEMO_INVOICES.map((i) => i.invoice_number),
        ]),
        title,
        description: body.description || null,
        invoice_type: type,
        status: "sent",
        currency: "USD",
        subtotal_cents: cents,
        tax_cents: 0,
        total_cents: cents,
        amount_paid_cents: 0,
        due_date: body.due_date || null,
        issued_at: now,
        paid_at: null,
        parent_invoice_id: parentId,
        metadata: {},
        created_at: now,
        updated_at: now,
      };
      existingNums.push(invoice.invoice_number);
      DEMO_INVOICES.unshift(invoice);
      const li: InvoiceLineItem = {
        id: randomUUID(),
        invoice_id: id,
        description: lineDesc,
        quantity: 1,
        unit_amount_cents: cents,
        amount_cents: cents,
        sort_order: 1,
        created_at: now,
      };
      DEMO_LINE_ITEMS.push(li);
      return invoice;
    };

    if (body.mode === "one_time") {
      const inv = makeInvoice("one_time", body.title, amount);
      return NextResponse.json({ redirectTo: `/clients/invoices/${inv.id}`, invoices: [inv] });
    }

    if (body.mode === "retainer") {
      const inv = makeInvoice("retainer", body.title, amount);
      const schedule: PaymentSchedule = {
        id: randomUUID(),
        client_id: body.client_id,
        invoice_id: inv.id,
        schedule_type: "retainer_monthly",
        label: `${body.title} (monthly)`,
        amount_cents: amount,
        cadence: "monthly",
        next_due_date: body.due_date || null,
        active: true,
        metadata: {},
        created_at: now,
        updated_at: now,
      };
      DEMO_SCHEDULES.push(schedule);
      return NextResponse.json({ redirectTo: `/clients/invoices/${inv.id}`, invoices: [inv] });
    }

    // deposit + balance
    const pct = Math.min(90, Math.max(10, body.deposit_percent || 50));
    const depositCents = Math.round((amount * pct) / 100);
    const balanceCents = amount - depositCents;
    const deposit = makeInvoice("deposit", `${body.title} — deposit`, depositCents);
    const balance = makeInvoice(
      "balance",
      `${body.title} — balance`,
      balanceCents,
      deposit.id
    );
    DEMO_SCHEDULES.push({
      id: randomUUID(),
      client_id: body.client_id,
      invoice_id: balance.id,
      schedule_type: "deposit_balance",
      label: `${body.title} — balance due`,
      amount_cents: balanceCents,
      cadence: null,
      next_due_date: body.due_date || null,
      active: true,
      metadata: { deposit_invoice_id: deposit.id },
      created_at: now,
      updated_at: now,
    });
    return NextResponse.json({
      redirectTo: `/clients/invoices/${deposit.id}`,
      invoices: [deposit, balance],
    });
  }

  // Supabase path
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: existing } = await supabase.from("invoices").select("invoice_number");
  let counterBase = nextInvoiceNumber((existing || []).map((r) => r.invoice_number));

  async function insertInvoice(
    type: InvoiceType,
    title: string,
    cents: number,
    parentId: string | null = null
  ) {
    const number = counterBase;
    const year = new Date().getFullYear();
    const n = parseInt(number.split("-").pop() || "1", 10) + 1;
    counterBase = `KK-${year}-${String(n).padStart(3, "0")}`;

    const { data: inv, error } = await supabase
      .from("invoices")
      .insert({
        client_id: body.client_id,
        invoice_number: number,
        title,
        description: body.description || null,
        invoice_type: type,
        status: "sent",
        subtotal_cents: cents,
        tax_cents: 0,
        total_cents: cents,
        amount_paid_cents: 0,
        due_date: body.due_date || null,
        issued_at: now,
        parent_invoice_id: parentId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const { error: liErr } = await supabase.from("invoice_line_items").insert({
      invoice_id: inv.id,
      description: lineDesc,
      quantity: 1,
      unit_amount_cents: cents,
      amount_cents: cents,
      sort_order: 1,
    });
    if (liErr) throw new Error(liErr.message);
    return inv;
  }

  try {
    if (body.mode === "one_time") {
      const inv = await insertInvoice("one_time", body.title, amount);
      return NextResponse.json({ redirectTo: `/clients/invoices/${inv.id}`, invoices: [inv] });
    }
    if (body.mode === "retainer") {
      const inv = await insertInvoice("retainer", body.title, amount);
      await supabase.from("payment_schedules").insert({
        client_id: body.client_id,
        invoice_id: inv.id,
        schedule_type: "retainer_monthly",
        label: `${body.title} (monthly)`,
        amount_cents: amount,
        cadence: "monthly",
        next_due_date: body.due_date || null,
        active: true,
      });
      return NextResponse.json({ redirectTo: `/clients/invoices/${inv.id}`, invoices: [inv] });
    }

    const pct = Math.min(90, Math.max(10, body.deposit_percent || 50));
    const depositCents = Math.round((amount * pct) / 100);
    const balanceCents = amount - depositCents;
    const deposit = await insertInvoice("deposit", `${body.title} — deposit`, depositCents);
    const balance = await insertInvoice(
      "balance",
      `${body.title} — balance`,
      balanceCents,
      deposit.id
    );
    await supabase.from("payment_schedules").insert({
      client_id: body.client_id,
      invoice_id: balance.id,
      schedule_type: "deposit_balance",
      label: `${body.title} — balance due`,
      amount_cents: balanceCents,
      next_due_date: body.due_date || null,
      active: true,
      metadata: { deposit_invoice_id: deposit.id },
    });
    return NextResponse.json({
      redirectTo: `/clients/invoices/${deposit.id}`,
      invoices: [deposit, balance],
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Create failed" },
      { status: 400 }
    );
  }
}
