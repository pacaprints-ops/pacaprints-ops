"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type ExpenseRow = {
  id: string;
  expense_date: string;
  amount: number;
  category: string;
  vendor: string | null;
  notes: string | null;
  paid_by: string;
  source_type: string;
  source_id: string | null;
  created_at: string;
  total_count: number;
};

function fmtGBP(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number.isFinite(n) ? n : 0
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB");
  } catch {
    return iso;
  }
}

// UK tax year: 6 April -> 6 April (end exclusive)
function getUKTaxYearRangeForYear(startYear: number) {
  const start = new Date(Date.UTC(startYear, 3, 6));
  const endExclusive = new Date(Date.UTC(startYear + 1, 3, 6));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(start), endExclusive: iso(endExclusive) };
}

function getCurrentUKTaxYearStartYear(today = new Date()) {
  const y = today.getFullYear();
  const startThisYear = new Date(Date.UTC(y, 3, 6));
  return today >= startThisYear ? y : y - 1;
}

function taxYearLabel(startYear: number) {
  const yy = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${yy}`;
}

// CSV helpers
function csvEscape(v: any) {
  const s = String(v ?? "");
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
function downloadCSV(filename: string, rows: any[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
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

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const currentStartYear = useMemo(() => getCurrentUKTaxYearStartYear(new Date()), []);
  const [taxYearStart, setTaxYearStart] = useState<number>(currentStartYear);
  const range = useMemo(() => getUKTaxYearRangeForYear(taxYearStart), [taxYearStart]);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [pageSize, setPageSize] = useState<number>(50);
  const [page, setPage] = useState<number>(0);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  async function load() {
    setLoading(true);
    setErrorMsg("");

    const offset = page * pageSize;

    const { data, error } = await supabase.rpc("list_expenses_in_range_paged", {
      p_from: range.start,
      p_to: range.endExclusive,
      p_search: debouncedQ || null,
      p_limit: pageSize,
      p_offset: offset,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const r = (data ?? []) as ExpenseRow[];
    setRows(r);
    setTotalCount(r.length ? Number(r[0].total_count || 0) : 0);

    setLoading(false);
  }

  // reset to first page when filters change
  useEffect(() => {
    setPage(0);
  }, [taxYearStart, debouncedQ, pageSize]);

  useEffect(() => {
    load().catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load expenses");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.endExclusive, debouncedQ, page, pageSize]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / Math.max(1, pageSize)));
  }, [totalCount, pageSize]);

  function exportCurrentPageCSV() {
    const header = ["Date", "Amount", "Category", "Vendor", "Paid by", "Source", "Notes"];
    const lines = rows.map((e) => [
      e.expense_date,
      e.amount,
      e.category,
      e.vendor ?? "",
      e.paid_by,
      e.source_type,
      e.notes ?? "",
    ]);
    downloadCSV(`expenses_${taxYearLabel(taxYearStart)}_page${page + 1}.csv`, [header, ...lines]);
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-600 mt-1">Searchable expense log (paged).</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/finance" className="text-sm text-gray-600 underline">
            Back to Finance
          </Link>
        </div>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
      ) : null}

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-600">Tax year</div>
          <select
            className="rounded-md border bg-white px-3 py-2 text-sm"
            value={taxYearStart}
            onChange={(e) => setTaxYearStart(Number(e.target.value))}
          >
            {[currentStartYear - 3, currentStartYear - 2, currentStartYear - 1, currentStartYear, currentStartYear + 1].map(
              (y) => (
                <option key={y} value={y}>
                  {taxYearLabel(y)}
                </option>
              )
            )}
          </select>
          <div className="text-xs text-gray-500">
            {range.start} → {range.endExclusive}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-600">Search</div>
          <input
            className="rounded-md border bg-white px-3 py-2 text-sm w-[260px] max-w-full"
            placeholder="Category, vendor, notes, paid by…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <button
              className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setQ("")}
              type="button"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="text-xs text-gray-600">Per page</div>
          <select
            className="rounded-md border bg-white px-3 py-2 text-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            onClick={exportCurrentPageCSV}
            disabled={rows.length === 0}
          >
            Export this page CSV
          </button>
        </div>
      </div>

      {/* Paged table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 border-b bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Amount</th>
                <th className="px-3 py-2 font-semibold">Category</th>
                <th className="px-3 py-2 font-semibold">Vendor</th>
                <th className="px-3 py-2 font-semibold">Paid by</th>
                <th className="px-3 py-2 font-semibold">Source</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-gray-600">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-gray-600">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr key={e.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 whitespace-nowrap">{fmtDate(e.expense_date)}</td>
                    <td className="px-3 py-2 font-semibold whitespace-nowrap">{fmtGBP(Number(e.amount || 0))}</td>
                    <td className="px-3 py-2">{e.category}</td>
                    <td className="px-3 py-2">{e.vendor ?? "—"}</td>
                    <td className="px-3 py-2">{e.paid_by}</td>
                    <td className="px-3 py-2">{e.source_type}</td>
                    <td className="px-3 py-2">{e.notes ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-white px-3 py-3">
          <div className="text-xs text-gray-600">
            {totalCount ? (
              <>
                Showing <span className="font-semibold">{page * pageSize + 1}</span>–
                <span className="font-semibold">{Math.min((page + 1) * pageSize, totalCount)}</span> of{" "}
                <span className="font-semibold">{totalCount}</span>
              </>
            ) : (
              "—"
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={page <= 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <div className="text-sm text-gray-700">
              Page <span className="font-semibold">{page + 1}</span> /{" "}
              <span className="font-semibold">{pageCount}</span>
            </div>
            <button
              type="button"
              className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={loading || page + 1 >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
