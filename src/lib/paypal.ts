/**
 * PayPal Orders API helpers (sandbox-ready).
 * When PAYPAL_* env vars are unset, returns deterministic demo stubs.
 */

const DEFAULT_BASE = "https://api-m.sandbox.paypal.com";

function paypalConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET &&
      !process.env.PAYPAL_CLIENT_ID.includes("your-paypal")
  );
}

export function getPaypalBase(): string {
  return process.env.PAYPAL_API_BASE || DEFAULT_BASE;
}

export async function getPaypalAccessToken(): Promise<string> {
  if (!paypalConfigured()) {
    return "DEMO_ACCESS_TOKEN";
  }

  const base = getPaypalBase();
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalOrder(input: {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  currency?: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; status: string; approveUrl?: string; demo?: boolean }> {
  const currency = input.currency || "USD";
  const value = (input.amountCents / 100).toFixed(2);

  if (!paypalConfigured()) {
    return {
      id: `DEMO-ORDER-${input.invoiceId.slice(0, 8)}`,
      status: "CREATED",
      approveUrl: input.returnUrl + "&demo=1",
      demo: true,
    };
  }

  const token = await getPaypalAccessToken();
  const base = getPaypalBase();

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.invoiceId,
          description: `Krewe & Kin invoice ${input.invoiceNumber}`,
          custom_id: input.invoiceId,
          amount: {
            currency_code: currency,
            value,
          },
        },
      ],
      application_context: {
        brand_name: "Krewe & Kin",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    links?: Array<{ rel: string; href: string }>;
  };

  const approveUrl = data.links?.find((l) => l.rel === "approve")?.href;

  return { id: data.id, status: data.status, approveUrl };
}

export async function capturePaypalOrder(
  orderId: string
): Promise<{
  id: string;
  status: string;
  captureId?: string;
  demo?: boolean;
  raw?: unknown;
}> {
  if (!paypalConfigured() || orderId.startsWith("DEMO-")) {
    return {
      id: orderId,
      status: "COMPLETED",
      captureId: `DEMO-CAPTURE-${Date.now()}`,
      demo: true,
    };
  }

  const token = await getPaypalAccessToken();
  const base = getPaypalBase();

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    purchase_units?: Array<{
      payments?: { captures?: Array<{ id: string }> };
    }>;
  };

  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

  return { id: data.id, status: data.status, captureId, raw: data };
}
