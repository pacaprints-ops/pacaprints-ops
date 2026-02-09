
// pacaprints-ops/app/products/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type Row = {
  product_id: string | null; // allow null grouping if older rows had no product_id
  product_name: string;
  units_sold: number;
  refunded_units: number;
  revenue_allocated: number;
  cost: number;
  gross_profit: number;
  margin: number | null;
};

type SortKey =
  | "product_name"
  | "units_sold"
  | "refunded_units"
  | "revenue_allocated"
  | "cost"
  | "gross_profit"
  | "margin";

function fmtGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number.isFinite(n) ? n : 0);
}

function fmtPct(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function csvEscape(v: string) {
  const needsQuotes = /[",\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export default function ProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Filters (default ALL TIME)
  const [platform, setPlatform] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>(""); // blank = all time
  const [toDate, setToDate] = useState<string>(""); // blank = all time

  // Search
  const [search, setSearch] = useState<string>("");

  // Sort (default: highest qty)
  const [sortKey, setSortKey] = useState<SortKey>("units_sold");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");

      // inclusive end date: add +1 day so p_to is exclusive but feels inclusive in UI
      const p_to = toDate
        ? new Date(new Date(toDate).getTime() + 86400000)
            .toISOString()
            .slice(0, 10)
        : null;

      const { data, error } = await supabase.rpc("list_products_summary", {
        p_from: fromDate || null,
        p_to,
        p_platform: platform,
      });

      if (error) {
        setErrorMsg(error.message);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as Row[]);
      setLoading(false);
    };

    load().catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load product sales");
      setRows([]);
      setLoading(false);
    });
  }, [platform, fromDate, toDate]);

  const filteredSortedRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = q
      ? rows.filter((r) => (r.product_name ?? "").toLowerCase().includes(q))
      : rows;

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];

      if (sortKey === "product_name") {
        return (
          dir *
          String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
            sensitivity: "base",
          })
        );
      }

      if (sortKey === "margin") {
        const an = av === null || !Number.isFinite(av) ? null : Number(av);
        const bn = bv === null || !Number.isFinite(bv) ? null : Number(bv);
        if (an === null && bn === null) return 0;
        if (an === null) return 1;
        if (bn === null) return -1;
        return dir * (an - bn);
      }

      const an = Number.isFinite(Number(av)) ? Number(av) : 0;
      const bn = Number.isFinite(Number(bv)) ? Number(bv) : 0;
      return dir * (an - bn);
    });

    return sorted;
  }, [rows, search, sortKey, sortDir]);

  const totals = useMemo(() => {
    return filteredSortedRows.reduce(
      (acc, r) => {
        acc.units += r.units_sold || 0;
        acc.refunds += r.refunded_units || 0;
        acc.revenue += r.revenue_allocated || 0;
        acc.cost += r.cost || 0;
        acc.profit += r.gross_profit || 0;
        return acc;
      },
      { units: 0, refunds: 0, revenue: 0, cost: 0, profit: 0 }
    );
  }, [filteredSortedRows]);

  const totalsMargin = totals.revenue > 0 ? totals.profit / totals.revenue : null;

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    if (nextKey === "product_name") setSortDir("asc");
    else setSortDir("desc");
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function exportCsv() {
    const header = [
      "Product",
      "Units (non-refunded)",
      "Refunds",
      "Revenue",
      "Cost",
      "Profit",
      "Margin",
    ];
    const lines = filteredSortedRows.map((r) => [
      r.product_name ?? "",
      String(r.units_sold ?? 0),
      String(r.refunded_units ?? 0),
      String(r.revenue_allocated ?? 0),
      String(r.cost ?? 0),
      String(r.gross_profit ?? 0),
      r.margin === null ? "" : String(r.margin),
    ]);

    const csv = [header, ...lines]
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `product_sales_${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="space-y-4">
      <div className="pp-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Product Sales
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sales/Revenue/Cost/Profit exclude refunded orders (so dashboard + tax stay
              correct). Refunds column counts units from orders marked “Refunded”.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/orders" className="text-sm font-semibold text-slate-700 underline">
              Orders
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-slate-700 underline">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="pp-card p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Platform
            </label>
            <select
              className="pp-select"
              value={platform ?? ""}
              onChange={(e) => setPlatform(e.target.value || null)}
            >
              <option value="">All</option>
              <option value="shopify">Shopify</option>
              <option value="tiktok">TikTok</option>
              <option value="etsy">Etsy</option>
              <option value="ebay">eBay</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              From
            </label>
            <input
              type="date"
              className="pp-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              To
            </label>
            <input
              type="date"
              className="pp-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Type a product name…"
              className="pp-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pp-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="pp-subtle">Units:</span>{" "}
              <span className="font-extrabold text-slate-900">{totals.units}</span>
            </div>
            <div>
              <span className="pp-subtle">Refunds:</span>{" "}
              <span className="font-extrabold text-slate-900">{totals.refunds}</span>
            </div>
            <div>
              <span className="pp-subtle">Revenue:</span>{" "}
              <span className="font-extrabold text-slate-900">
                {fmtGBP(totals.revenue)}
              </span>
            </div>
            <div>
              <span className="pp-subtle">Cost:</span>{" "}
              <span className="font-extrabold text-slate-900">
                {fmtGBP(totals.cost)}
              </span>
            </div>
            <div>
              <span className="pp-subtle">Profit:</span>{" "}
              <span className="font-extrabold text-slate-900">
                {fmtGBP(totals.profit)}
              </span>
            </div>
            <div>
              <span className="pp-subtle">Margin:</span>{" "}
              <span className="font-extrabold text-slate-900">
                {fmtPct(totalsMargin)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="pp-btn pp-btn-secondary"
            disabled={loading || filteredSortedRows.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div className="pp-card p-4">
          <div className="text-sm font-semibold text-red-700">{errorMsg}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="pp-card p-4">
          <div className="text-sm text-slate-600">Loading…</div>
        </div>
      ) : filteredSortedRows.length === 0 ? (
        <div className="pp-card p-4">
          <div className="text-sm text-slate-600">No matching products.</div>
        </div>
      ) : (
        <div className="pp-table">
          <table>
            <thead>
              <tr className="text-left">
                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("product_name")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Product{sortIndicator("product_name")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("units_sold")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Sales{sortIndicator("units_sold")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("refunded_units")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Refunds{sortIndicator("refunded_units")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("revenue_allocated")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Revenue{sortIndicator("revenue_allocated")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("cost")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Cost{sortIndicator("cost")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("gross_profit")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Profit{sortIndicator("gross_profit")}
                  </button>
                </th>

                <th>
                  <button
                    type="button"
                    onClick={() => toggleSort("margin")}
                    className="underline decoration-transparent hover:decoration-inherit"
                  >
                    Margin{sortIndicator("margin")}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSortedRows.map((r, idx) => (
                <tr key={`${r.product_id ?? "null"}_${idx}`}>
                  <td className="font-semibold text-slate-900">{r.product_name}</td>
                  <td>{r.units_sold}</td>
                  <td>{r.refunded_units}</td>
                  <td>{fmtGBP(r.revenue_allocated)}</td>
                  <td>{fmtGBP(r.cost)}</td>
                  <td>{fmtGBP(r.gross_profit)}</td>
                  <td>{fmtPct(r.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
