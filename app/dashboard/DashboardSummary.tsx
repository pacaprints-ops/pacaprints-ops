
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type DashboardSummaryRow = {
  from_date: string;
  to_date: string;
  platform: string | null;
  revenue: number;
  cogs: number;
  profit: number;
  order_count: number;
  stock_value: number;
};

type OrderRow = {
  order_date: string;
  total_revenue: number | string | null;
  total_cost: number | string | null;
  gross_profit: number | string | null;
  is_refunded?: boolean | null;
};

type MaterialRow = {
  id: string;
  name: string;
  reorder_level: number | string | null;
  track_stock: boolean | null;
};

type BatchRow = {
  material_id: string;
  remaining_quantity: number | string | null;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function toNumber(v: any) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}
function formatGBP(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}
function formatInt(value: number) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value ?? 0);
}
function monthLabel(i: number) {
  return new Date(2000, i, 1).toLocaleString("en-GB", { month: "short" });
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          const escaped = s.replaceAll('"', '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-900 text-center">{title}</div>
      <div className="mt-4 flex items-center justify-center text-2xl font-semibold text-gray-900 min-h-[44px]">
        {value}
      </div>
    </div>
  );
}

export default function DashboardSummary() {
  // Filters
  const [platform, setPlatform] = useState<string>("");
  const [platformCustom, setPlatformCustom] = useState<string>("");

  const [timeframe, setTimeframe] = useState<string>("mtd");
  const todayIso = isoDate(new Date());
  const [customFrom, setCustomFrom] = useState<string>(todayIso);
  const [customTo, setCustomTo] = useState<string>(todayIso);

  // Data states
  const [summary, setSummary] = useState<DashboardSummaryRow | null>(null);
  const [refundedCount, setRefundedCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  const [monthlyLoading, setMonthlyLoading] = useState<boolean>(true);
  const [monthlyError, setMonthlyError] = useState<string>("");
  const [monthly, setMonthly] = useState<
    Array<{
      monthIndex: number;
      a: { orders: number; revenue: number; cogs: number; profit: number };
      b: { orders: number; revenue: number; cogs: number; profit: number };
    }>
  >([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const platformValueToSend = useMemo(() => {
    if (!platform) return null;
    if (platform === "custom") return platformCustom.trim() || null;
    return platform;
  }, [platform, platformCustom]);

  const { fromDate, toDateExclusive } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = addDays(today, 1);

    if (timeframe === "mtd") {
      return { fromDate: isoDate(startOfMonth(today)), toDateExclusive: isoDate(tomorrow) };
    }

    if (timeframe === "last_month") {
      const firstThisMonth = startOfMonth(today);
      const firstLastMonth = new Date(firstThisMonth.getFullYear(), firstThisMonth.getMonth() - 1, 1);
      return { fromDate: isoDate(firstLastMonth), toDateExclusive: isoDate(firstThisMonth) };
    }

    const inclusiveTo = customTo || todayIso;
    return {
      fromDate: customFrom || todayIso,
      toDateExclusive: isoDate(addDays(new Date(inclusiveTo), 1)),
    };
  }, [timeframe, customFrom, customTo, todayIso]);

  async function loadTopSummary() {
    setLoading(true);
    setErrorMsg("");

    const args: any = {
      p_from_date: fromDate,
      p_to_date: toDateExclusive,
    };
    if (platformValueToSend) args.p_platform = platformValueToSend;

    const { data, error } = await supabase.rpc("dashboard_summary", args);

    if (error) {
      setErrorMsg(error.message);
      setSummary(null);
      setLoading(false);
      return;
    }

    setSummary((data?.[0] ?? null) as DashboardSummaryRow | null);
    setLoading(false);
  }

  async function loadRefundedCount() {
    const args: any = {
      p_from: fromDate,
      p_to: toDateExclusive,
    };
    if (platformValueToSend) args.p_platform = platformValueToSend;

    const { data, error } = await supabase.rpc("dashboard_refunded_count", args);

    if (error) {
      setRefundedCount(0);
      return;
    }

    setRefundedCount(toNumber(data ?? 0));
  }

  async function loadLowStockAlert() {
    const { data: mats, error: matsErr } = await supabase
      .from("materials")
      .select("id,name,reorder_level,track_stock");

    if (matsErr) {
      setLowStockCount(0);
      return;
    }

    const { data: b, error: bErr } = await supabase
      .from("batches")
      .select("material_id,remaining_quantity");

    if (bErr) {
      setLowStockCount(0);
      return;
    }

    const materials = (mats ?? []) as MaterialRow[];
    const batches = (b ?? []) as BatchRow[];

    const onHandByMaterial = new Map<string, number>();
    for (const row of batches) {
      const mid = row.material_id;
      const qty = toNumber(row.remaining_quantity);
      onHandByMaterial.set(mid, (onHandByMaterial.get(mid) ?? 0) + qty);
    }

    let count = 0;
    for (const m of materials) {
      if (!m.track_stock) continue;
      const rl = m.reorder_level === null ? null : toNumber(m.reorder_level);
      if (rl === null || !Number.isFinite(rl)) continue;

      const onHand = onHandByMaterial.get(m.id) ?? 0;
      if (onHand < rl) count += 1;
    }

    setLowStockCount(count);
  }

  async function loadMonthlyTable() {
    setMonthlyLoading(true);
    setMonthlyError("");

    const now = new Date();
    const yearA = now.getFullYear();
    const yearB = yearA - 1;
    const platformFilter = platformValueToSend;

    async function fetchYear(y: number) {
      const from = `${y}-01-01`;
      const to = `${y + 1}-01-01`;

      let q = supabase
        .from("orders")
        .select("order_date,total_revenue,total_cost,gross_profit,is_refunded")
        .gte("order_date", from)
        .lt("order_date", to);

      if (platformFilter) q = q.eq("platform", platformFilter);

      // Exclude refunded from monthly table
      q = q.or("is_refunded.is.null,is_refunded.eq.false");

      const { data, error } = await q;
      if (error) throw new Error(error.message);

      return (data ?? []) as OrderRow[];
    }

    try {
      const [aRows, bRows] = await Promise.all([fetchYear(yearA), fetchYear(yearB)]);

      function aggregate(rows: OrderRow[]) {
        const byMonth = Array.from({ length: 12 }, () => ({
          orders: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
        }));

        for (const r of rows) {
          const d = new Date(r.order_date);
          const m = d.getMonth();
          if (m < 0 || m > 11) continue;

          byMonth[m].orders += 1;
          byMonth[m].revenue += toNumber(r.total_revenue);
          byMonth[m].cogs += toNumber(r.total_cost);
          byMonth[m].profit += toNumber(r.gross_profit);
        }
        return byMonth;
      }

      const aAgg = aggregate(aRows);
      const bAgg = aggregate(bRows);

      setMonthly(
        Array.from({ length: 12 }, (_, i) => ({
          monthIndex: i,
          a: aAgg[i],
          b: bAgg[i],
        }))
      );

      setMonthlyLoading(false);
    } catch (e: any) {
      setMonthlyError(e?.message || "Failed to load monthly table");
      setMonthlyLoading(false);
    }
  }

  function exportMonthlyCSV() {
    const now = new Date();
    const yearA = now.getFullYear();
    const yearB = yearA - 1;

    const header = [
      "Month",
      `${yearB} Orders`,
      `${yearB} Revenue`,
      `${yearB} Cost`,
      `${yearB} Profit`,
      `${yearA} Orders`,
      `${yearA} Revenue`,
      `${yearA} Cost`,
      `${yearA} Profit`,
    ];

    const lines = monthly.map((r) => [
      monthLabel(r.monthIndex),
      String(r.b.orders),
      String(r.b.revenue),
      String(r.b.cogs),
      String(r.b.profit),
      String(r.a.orders),
      String(r.a.revenue),
      String(r.a.cogs),
      String(r.a.profit),
    ]);

    downloadCSV(`dashboard_monthly_${yearB}_${yearA}.csv`, [header, ...lines]);
  }

  useEffect(() => {
    loadTopSummary();
    loadRefundedCount();
    loadLowStockAlert();
    loadMonthlyTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDateExclusive, platformValueToSend]);

  const now = new Date();
  const yearA = now.getFullYear();
  const yearB = yearA - 1;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">PacaPrints Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Showing:{" "}
            <span className="font-medium text-gray-700">
              {timeframe === "mtd" ? "MTD" : timeframe === "last_month" ? "Last month" : "Custom range"}
            </span>
            {" · "}
            <span className="font-medium text-gray-700">
              {platformValueToSend ? platformValueToSend : "All platforms"}
            </span>
            {" · "}
            <span className="font-medium text-gray-700">
              {fromDate} → {timeframe === "custom" ? customTo : isoDate(addDays(new Date(toDateExclusive), -1))}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Platform */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-900">Platform</label>
            <select
              className="rounded-lg border bg-white px-3 py-2 text-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="">All</option>
              <option value="tiktok">TikTok</option>
              <option value="etsy">Etsy</option>
              <option value="ebay">eBay</option>
              <option value="shopify">Shopify</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {platform === "custom" && (
            <input
              type="text"
              placeholder="Type platform value…"
              className="rounded-lg border bg-white px-3 py-2 text-sm"
              value={platformCustom}
              onChange={(e) => setPlatformCustom(e.target.value)}
            />
          )}

          {/* Time */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-900">Time</label>
            <select
              className="rounded-lg border bg-white px-3 py-2 text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="mtd">MTD</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom range</option>
            </select>
          </div>

          {timeframe === "custom" && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-gray-900">From</label>
              <input
                type="date"
                className="rounded-lg border bg-white px-3 py-2 text-sm"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <label className="text-sm font-semibold text-gray-900">To</label>
              <input
                type="date"
                className="rounded-lg border bg-white px-3 py-2 text-sm"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Errors */}
      {errorMsg ? (
        <div className="mb-6 rounded-lg border bg-red-50 p-3 text-sm text-red-700">
          Failed to load dashboard summary: {errorMsg}
        </div>
      ) : null}

      {/* Top Boxes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard title="Total Orders" value={loading || !summary ? "—" : formatInt(toNumber(summary.order_count))} />
        <StatCard title="Revenue" value={loading || !summary ? "—" : formatGBP(toNumber(summary.revenue))} />
        <StatCard title="Cost" value={loading || !summary ? "—" : formatGBP(toNumber(summary.cogs))} />
        <StatCard title="Profit" value={loading || !summary ? "—" : formatGBP(toNumber(summary.profit))} />
        <StatCard title="Refunded" value={loading ? "—" : formatInt(refundedCount)} />
      </div>

      {/* Second row */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-sm font-semibold text-gray-900">Low Stock Alert</div>
          <div className={`mt-4 text-2xl font-semibold ${lowStockCount > 0 ? "text-red-700" : "text-gray-900"}`}>
            {formatInt(lowStockCount)}
          </div>
          <div className="mt-2 text-xs text-gray-500">Count of raw materials where on-hand &lt; reorder level</div>
        </div>

        <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="text-sm font-semibold text-gray-900">Total Stock Value</div>
          <div className="mt-4 text-2xl font-semibold text-gray-900">
            {loading || !summary ? "—" : formatGBP(toNumber(summary.stock_value))}
          </div>
          <div className="mt-2 text-xs text-gray-500">Always total (not affected by timeframe)</div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-900">
            Monthly totals ({yearB} vs {yearA})
            <div className="mt-1 text-xs font-normal text-gray-500 md:hidden">
              Swipe sideways to see {yearA} →
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-900"
            disabled={monthlyLoading || !!monthlyError || monthly.length === 0}
            onClick={exportMonthlyCSV}
          >
            Export monthly CSV
          </button>
        </div>

        {monthlyError ? (
          <div className="rounded-lg border bg-red-50 p-3 text-sm text-red-700">
            Failed to load monthly table: {monthlyError}
          </div>
        ) : monthlyLoading ? (
          <div className="text-sm text-gray-600">Loading monthly table…</div>
        ) : (
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">Month</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearB} Orders</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearB} Revenue</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearB} Cost</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearB} Profit</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearA} Orders</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearA} Revenue</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearA} Cost</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 whitespace-nowrap">{yearA} Profit</th>
                  </tr>
                </thead>

                <tbody>
                  {monthly.map((r) => (
                    <tr key={r.monthIndex} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {monthLabel(r.monthIndex)}
                      </td>

                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatInt(r.b.orders)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(r.b.revenue)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(r.b.cogs)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(r.b.profit)}</td>

                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatInt(r.a.orders)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(r.a.revenue)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(r.a.cogs)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatGBP(r.a.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
