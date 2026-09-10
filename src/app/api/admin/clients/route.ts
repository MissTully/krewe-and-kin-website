import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/auth";
import { DEMO_CLIENTS, isDemoMode } from "@/lib/demo-data";
import type { Client } from "@/lib/types";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    company_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };

  if (!body.company_name || !body.contact_name || !body.email) {
    return NextResponse.json(
      { error: "company_name, contact_name, and email are required" },
      { status: 400 }
    );
  }

  if (isDemoMode()) {
    const client: Client = {
      id: randomUUID(),
      profile_id: null,
      company_name: body.company_name,
      contact_name: body.contact_name,
      email: body.email,
      phone: body.phone || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    DEMO_CLIENTS.push(client);
    return NextResponse.json({ client });
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      company_name: body.company_name,
      contact_name: body.contact_name,
      email: body.email,
      phone: body.phone || null,
      notes: body.notes || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ client: data });
}
