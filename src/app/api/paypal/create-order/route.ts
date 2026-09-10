import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getInvoiceById } from "@/lib/data";
import { createPaypalOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { invoiceId?: string };
  if (!body.invoiceId) {
    return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
  }

  const invoice = await getInvoiceById(body.invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const balance = Math.max(0, invoice.total_cents - invoice.amount_paid_cents);
  if (balance <= 0) {
    return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const returnUrl = `${origin}/clients/invoices/${invoice.id}?paypal=return`;
  const cancelUrl = `${origin}/clients/invoices/${invoice.id}?paypal=cancel`;

  try {
    const order = await createPaypalOrder({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amountCents: balance,
      currency: invoice.currency,
      returnUrl,
      cancelUrl,
    });
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PayPal error" },
      { status: 500 }
    );
  }
}
