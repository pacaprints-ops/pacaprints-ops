"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type OrderRow = {
  id: string;
  order_no: number;
  created_at: string;
  order_date: string | null;
  platform: string | null;
  platform_order_ref: string | null;
  customer_name: string | null;

  // Existing
  revenue: any; // payout (net) - you already have this
  shipping_cost: any;

  total_cost: any; // FIFO COGS for non-historical orders
  gross_profit: any; // stored value (we won't rely on it for now)

  // New (may be missing from RPC until you update it / import data)
  gross_revenue?: any;     // what customer paid (gross)
  platform_fees?: any;     // platform fees
  cogs_override?: any;     // historical COGS backfill per order

  items_summary: string;
  is_settled: boolean;
  is_refunded: boolean;
};

function formatGBP(v: any) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

function formatDateUK(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB").format(d);
}

export default function OrdersTableClient({ rows }: { rows: OrderRow[] }) {
  const [localRows, setLocalRows] = useState<OrderRow[]>(rows);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  async function setFlags(
    orderId: string,
    patch: Partial<Pick<OrderRow, "is_settled" | "is_refunded">>
  ) {
    setErrorMsg("");
    setSavingIds((p) => ({ ...p, [orderId]: true }));

    const current = localRows.find((r) => r.id === orderId);
    if (!current) return;

    const nextSettled = patch.is_settled ?? current.is_settled;
    const nextRefunded = patch.is_refunded ?? current.is_refunded;

    // optimistic UI
    setLocalRows((prev) =>
      prev.map((r) =>
        r.id === orderId ? { ...r, is_settled: nextSettled, is_refunded: nextRefunded } : r
      )
    );

    const { error } = await supabase.rpc("set_order_flags", {
      p_order_id: orderId,
      p_is_settled: nextSettled,
      p_is_refunded: nextRefunded,
    });

    setSavingIds((p) => ({ ...p, [orderId]: false }));

    if (error) {
      setLocalRows((prev) => prev.map((r) => (r.id === orderId ? current : r)));
      setErrorMsg(error.message);
    }
  }

  return (
    <>
      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {[
                "Order #",
                "Order date",
                "Platform",
                "Platform ref",
                "Products",
                "Customer",
                "Gross",
                "Fees",
                "Payout",
                "Shipping",
                "COGS",
                "Profit",
                "Settled",
                "Refunded",
                "Edit",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-900 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {localRows.map((o) => {
              const saving = !!savingIds[o.id];
              const refunded = !!o.is_refunded;

              // Safe fallbacks (nothing breaks before imports/RPC updates)
              const gross = Number((o as any).gross_revenue ?? o.revenue ?? 0);
              const fees = Number((o as any).platform_fees ?? 0);
              const payout = Number(o.revenue ?? 0);

              // For history, you'll backfill cogs_override. For new orders, FIFO total_cost.
              const cogs = Number((o as any).cogs_override ?? o.total_cost ?? 0);

              // UI-only profit for now (safe, no trigger changes)
              const profit = gross - fees - cogs;

              return (
                <tr
                  key={o.id}
                  className={`border-b last:border-b-0 hover:bg-gray-50 ${
                    refunded ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{o.order_no}</td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/orders/${o.id}`}
                      className="text-gray-900 underline decoration-transparent hover:decoration-gray-400"
                    >
                      {formatDateUK(o.order_date)}
                    </Link>
                    {refunded ? (
                      <div className="text-[11px] text-red-700 font-semibold">REFUNDED</div>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{o.platform ?? "—"}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {o.platform_order_ref ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">{o.items_summary ? o.items_summary : "—"}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{o.customer_name ?? "—"}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(gross)}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(fees)}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(payout)}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(o.shipping_cost)}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(cogs)}</td>

                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(profit)}</td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!o.is_settled}
                      disabled={saving}
                      onChange={(e) => setFlags(o.id, { is_settled: e.target.checked })}
                      title="Settled"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={!!o.is_refunded}
                      disabled={saving}
                      onChange={(e) => setFlags(o.id, { is_refunded: e.target.checked })}
                      title="Refunded"
                    />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/orders/${o.id}`} className="text-sm text-gray-700 underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}

            {localRows.length === 0 && (
              <tr>
                <td colSpan={15} className="px-4 py-6 text-gray-600">
                  No orders for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
