import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getInvoiceById, markInvoicePaid } from "@/lib/data";
import { capturePaypalOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    orderId?: string;
    invoiceId?: string;
  };

  if (!body.orderId || !body.invoiceId) {
    return NextResponse.json(
      { error: "orderId and invoiceId required" },
      { status: 400 }
    );
  }

  const invoice = await getInvoiceById(body.invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  try {
    const capture = await capturePaypalOrder(body.orderId);
    if (capture.status !== "COMPLETED" && !capture.demo) {
      return NextResponse.json(
        { error: `Unexpected capture status: ${capture.status}` },
        { status: 400 }
      );
    }

    const amount =
      Math.max(0, invoice.total_cents - invoice.amount_paid_cents) ||
      invoice.total_cents;

    await markInvoicePaid({
      invoiceId: invoice.id,
      amountCents: amount,
      orderId: body.orderId,
      captureId: capture.captureId,
      payload: (capture.raw as Record<string, unknown>) || { demo: capture.demo },
    });

    return NextResponse.json({ ok: true, capture });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Capture failed" },
      { status: 500 }
    );
  }
}
