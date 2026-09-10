import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    borderBottomWidth: 2,
    borderBottomColor: "#C9A227",
    paddingBottom: 12,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0a0a0a" },
  brandSub: { fontSize: 9, color: "#666", marginTop: 4 },
  meta: { textAlign: "right" },
  h2: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    color: "#F5F0E6",
    padding: 8,
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e0d5",
    padding: 8,
  },
  colDesc: { width: "50%" },
  colQty: { width: "15%", textAlign: "right" },
  colUnit: { width: "17%", textAlign: "right" },
  colAmt: { width: "18%", textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalLine: { flexDirection: "row", width: 200, justifyContent: "space-between", marginBottom: 4 },
  totalStrong: { fontFamily: "Helvetica-Bold", fontSize: 13 },
  footer: { position: "absolute", bottom: 36, left: 40, right: 40, fontSize: 9, color: "#666" },
  status: { marginTop: 6, fontFamily: "Helvetica-Bold", color: "#C9A227" },
});

function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const items = invoice.line_items || [];
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Krewe &amp; Kin</Text>
            <Text style={styles.brandSub}>Studio billing · missy@kreweandkin.com</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.h2}>Invoice {invoice.invoice_number}</Text>
            <Text>Status: {invoice.status}</Text>
            <Text style={styles.status}>{invoice.title}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.h2}>Bill to</Text>
          <Text>{invoice.client?.company_name || "Client"}</Text>
          <Text>{invoice.client?.contact_name}</Text>
          <Text>{invoice.client?.email}</Text>
        </View>

        <View style={styles.row}>
          <Text>Issued: {invoice.issued_at?.slice(0, 10) || "—"}</Text>
          <Text>Due: {invoice.due_date || "—"}</Text>
          <Text>Type: {invoice.invoice_type}</Text>
        </View>

        {invoice.description ? (
          <Text style={{ marginTop: 10, color: "#444" }}>{invoice.description}</Text>
        ) : null}

        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colUnit}>Unit</Text>
          <Text style={styles.colAmt}>Amount</Text>
        </View>
        {items.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colUnit}>
              {money(item.unit_amount_cents, invoice.currency)}
            </Text>
            <Text style={styles.colAmt}>
              {money(item.amount_cents, invoice.currency)}
            </Text>
          </View>
        ))}

        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text>Subtotal</Text>
            <Text>{money(invoice.subtotal_cents, invoice.currency)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text>Tax</Text>
            <Text>{money(invoice.tax_cents, invoice.currency)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalStrong}>Total</Text>
            <Text style={styles.totalStrong}>
              {money(invoice.total_cents, invoice.currency)}
            </Text>
          </View>
          <View style={styles.totalLine}>
            <Text>Paid</Text>
            <Text>{money(invoice.amount_paid_cents, invoice.currency)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalStrong}>Balance due</Text>
            <Text style={styles.totalStrong}>
              {money(
                Math.max(0, invoice.total_cents - invoice.amount_paid_cents),
                invoice.currency
              )}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for working with Krewe &amp; Kin. Questions? missy@kreweandkin.com
        </Text>
      </Page>
    </Document>
  );
}
