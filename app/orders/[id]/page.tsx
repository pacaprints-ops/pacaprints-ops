"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type OrderHeader = {
  id: string;
  order_no: number;
  created_at: string;
  order_date: string | null;
  platform: string | null;
  platform_order_ref: string | null;
  customer_name: string | null;
  revenue: any;
  shipping_cost: any;
  discounts: any;
  total_cost: any;
  total_revenue: any;
  gross_profit: any;
  is_settled: boolean;
  is_refunded: boolean;
  refund_notes: string | null;
};

type OrderLine = {
  order_product_id: string;
  product_name: string;
  recipe_name: string;
  quantity: number;
  line_cost: any;
};

function fmtGBP(n: any) {
  const x = Number(n ?? 0);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number.isFinite(x) ? x : 0
  );
}

function toNum(s: string) {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export default function OrderEditPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [loading, setLoading] = useState(true);
  const [savingFlags, setSavingFlags] = useState(false);
  const [savingHeader, setSavingHeader] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [order, setOrder] = useState<OrderHeader | null>(null);
  const [lines, setLines] = useState<OrderLine[]>([]);

  // editable header fields
  const [orderDate, setOrderDate] = useState<string>("");
  const [platform, setPlatform] = useState<string>("tiktok");
  const [platformRef, setPlatformRef] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [revenue, setRevenue] = useState<string>("0");
  const [shippingCost, setShippingCost] = useState<string>("0");
  const [discounts, setDiscounts] = useState<string>("0");

  // refund notes
  const [refundNotes, setRefundNotes] = useState<string>("");

  async function load(id: string) {
    setLoading(true);
    setErrorMsg("");

    const { data: h, error: hErr } = await supabase.rpc("get_order_header", { p_order_id: id });
    if (hErr) {
      setErrorMsg(hErr.message);
      setLoading(false);
      return;
    }

    const header = Array.isArray(h) ? (h[0] as OrderHeader) : (h as OrderHeader);
    setOrder(header);

    // hydrate editable fields from DB (so nothing "goes blank")
    setOrderDate(header.order_date ?? "");
    setPlatform(header.platform ?? "tiktok");
    setPlatformRef(header.platform_order_ref ?? "");
    setCustomerName(header.customer_name ?? "");
    setRevenue(String(header.revenue ?? 0));
    setShippingCost(String(header.shipping_cost ?? 0));
    setDiscounts(String(header.discounts ?? 0));
    setRefundNotes(header.refund_notes ?? "");

    const { data: l, error: lErr } = await supabase.rpc("list_order_products", { p_order_id: id });
    if (lErr) {
      setErrorMsg(lErr.message);
      setLoading(false);
      return;
    }

    setLines((l ?? []) as OrderLine[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!orderId) return;
    load(orderId).catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load order");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function saveFlags(nextSettled: boolean, nextRefunded: boolean, nextNotes: string) {
    if (!orderId || !order) return;

    setSavingFlags(true);
    setErrorMsg("");

    // optimistic
    setOrder({ ...order, is_settled: nextSettled, is_refunded: nextRefunded, refund_notes: nextNotes });
    setRefundNotes(nextNotes);

    const { error } = await supabase.rpc("set_order_flags", {
      p_order_id: orderId,
      p_is_settled: nextSettled,
      p_is_refunded: nextRefunded,
      p_refund_notes: nextRefunded ? (nextNotes?.trim() || null) : null,
    });

    setSavingFlags(false);

    if (error) {
      await load(orderId);
      setErrorMsg(error.message);
    }
  }

  async function saveHeader() {
    if (!orderId || !order) return;

    setSavingHeader(true);
    setErrorMsg("");

    if (!orderDate) {
      setSavingHeader(false);
      setErrorMsg("Order date is required.");
      return;
    }

    const { error } = await supabase.rpc("update_order_header", {
      p_order_id: orderId,
      p_order_date: orderDate,
      p_platform: platform || null,
      p_platform_order_ref: platformRef.trim() || null,
      p_customer_name: customerName.trim() || null,
      p_revenue: toNum(revenue),
      p_shipping_cost: toNum(shippingCost),
      p_discounts: toNum(discounts),
    });

    setSavingHeader(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await load(orderId);
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit order</h1>
          <p className="text-sm text-gray-600 mt-1">Order ID: {orderId ?? "—"}</p>
        </div>

        <Link href="/orders" className="text-sm text-gray-600 underline">
          Back to orders
        </Link>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : !order ? (
        <div className="text-sm text-gray-600">Order not found.</div>
      ) : (
        <div className="space-y-4">
          {/* Editable header */}
          <section className="rounded-lg border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Order #{order.order_no}
                </div>
                <div className="text-xs text-gray-500">Created: {order.created_at}</div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!order.is_settled}
                    disabled={savingFlags}
                    onChange={(e) => saveFlags(e.target.checked, !!order.is_refunded, refundNotes)}
                  />
                  Settled
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!order.is_refunded}
                    disabled={savingFlags}
                    onChange={(e) => {
                      const nextRefunded = e.target.checked;
                      const nextNotes = nextRefunded ? refundNotes : "";
                      saveFlags(!!order.is_settled, nextRefunded, nextNotes);
                    }}
                  />
                  Refunded
                </label>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Order date</div>
                <input
                  type="date"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </label>

              <label className="text-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Platform</div>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option value="tiktok">TikTok</option>
                  <option value="shopify">Shopify</option>
                  <option value="etsy">Etsy</option>
                  <option value="ebay">eBay</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              <label className="text-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Platform ref</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={platformRef}
                  onChange={(e) => setPlatformRef(e.target.value)}
                  placeholder="Order ID / reference"
                />
              </label>

              <label className="text-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Customer name</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label className="text-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Revenue (net payout)</div>
                <input
                  inputMode="decimal"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </label>

              <label className="text-sm">
                <div className="text-xs font-medium text-gray-700 mb-1">Shipping cost</div>
                <input
                  inputMode="decimal"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                />
              </label>

              <label className="text-sm sm:col-span-2">
                <div className="text-xs font-medium text-gray-700 mb-1">Discounts</div>
                <input
                  inputMode="decimal"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={discounts}
                  onChange={(e) => setDiscounts(e.target.value)}
                />
              </label>
            </div>

            {/* Refund notes appears only when refunded */}
            {order.is_refunded ? (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Refund notes (optional)</label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  rows={3}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Why was this refunded?"
                />
                <button
                  type="button"
                  disabled={savingFlags}
                  className="mt-2 rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                  onClick={() => saveFlags(!!order.is_settled, true, refundNotes)}
                >
                  {savingFlags ? "Saving…" : "Save refund note"}
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={saveHeader}
              disabled={savingHeader}
              className="mt-4 w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingHeader ? "Saving…" : "Save order changes"}
            </button>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-md border bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-600">Saved revenue</div>
                <div className="text-sm font-semibold">{fmtGBP(order.revenue)}</div>
              </div>
              <div className="rounded-md border bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-600">Saved shipping</div>
                <div className="text-sm font-semibold">{fmtGBP(order.shipping_cost)}</div>
              </div>
              <div className="rounded-md border bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-600">COGS</div>
                <div className="text-sm font-semibold">{fmtGBP(order.total_cost)}</div>
              </div>
              <div className="rounded-md border bg-gray-50 px-3 py-2">
                <div className="text-xs text-gray-600">Profit</div>
                <div className="text-sm font-semibold">{fmtGBP(order.gross_profit)}</div>
              </div>
            </div>
          </section>

          {/* Lines read-only */}
          <section className="rounded-lg border bg-white p-4">
            <div className="font-semibold text-gray-900 mb-3">Line items</div>

            {lines.length === 0 ? (
              <div className="text-sm text-gray-600">No line items.</div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm bg-white">
                  <thead className="border-b bg-gray-50">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-semibold">Product</th>
                      <th className="px-3 py-2 font-semibold">Recipe</th>
                      <th className="px-3 py-2 font-semibold">Qty</th>
                      <th className="px-3 py-2 font-semibold">Line cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={l.order_product_id} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{l.product_name}</td>
                        <td className="px-3 py-2">{l.recipe_name}</td>
                        <td className="px-3 py-2">{l.quantity}</td>
                        <td className="px-3 py-2 font-semibold">{fmtGBP(l.line_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
