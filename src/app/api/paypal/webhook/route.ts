import { NextResponse } from "next/server";
import { markInvoicePaid } from "@/lib/data";

/**
 * PayPal webhook stub.
 * Expects PAYMENT.CAPTURE.COMPLETED (or CHECKOUT.ORDER.APPROVED with capture).
 * Marks the related invoice paid using custom_id / reference_id = invoice UUID.
 */
export async function POST(request: Request) {
  let event: {
    event_type?: string;
    resource?: {
      id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
      custom_id?: string;
      amount?: { value?: string; currency_code?: string };
      purchase_units?: Array<{
        custom_id?: string;
        reference_id?: string;
        amount?: { value?: string };
      }>;
    };
  };

  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Production: verify webhook signature with PAYPAL_WEBHOOK_ID here.

  const type = event.event_type || "";
  const resource = event.resource || {};

  const invoiceId =
    resource.custom_id ||
    resource.purchase_units?.[0]?.custom_id ||
    resource.purchase_units?.[0]?.reference_id;

  if (!invoiceId) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: "No invoice id on event",
    });
  }

  if (
    type.includes("CAPTURE.COMPLETED") ||
    type.includes("PAYMENT.CAPTURE") ||
    type === "CHECKOUT.ORDER.COMPLETED"
  ) {
    const value =
      resource.amount?.value ||
      resource.purchase_units?.[0]?.amount?.value ||
      "0";
    const amountCents = Math.round(parseFloat(value) * 100);
    const orderId =
      resource.supplementary_data?.related_ids?.order_id ||
      resource.id ||
      "webhook-unknown";

    try {
      await markInvoicePaid({
        invoiceId,
        amountCents: amountCents || 0,
        orderId,
        captureId: resource.id,
        payload: event as Record<string, unknown>,
      });
      return NextResponse.json({ ok: true, markedPaid: invoiceId });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Failed to mark paid" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, ignored: true, event_type: type });
}
