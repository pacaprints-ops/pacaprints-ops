"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type AdjRow = {
  id: string;
  created_at: string;
  material_id: string;
  material_name: string;
  qty_change: number;
  reason: string;
  created_by: string | null;
};

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function MaterialsAdjustmentsPage() {
  const [rows, setRows] = useState<AdjRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  async function load() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.rpc("list_material_adjustments", {
      p_search: search.trim() || null,
      p_limit: 200,
    });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as AdjRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load adjustments");
      setRows([]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        if (r.qty_change > 0) acc.added += r.qty_change;
        else acc.removed += Math.abs(r.qty_change);
        acc.count += 1;
        return acc;
      },
      { count: 0, added: 0, removed: 0 }
    );
  }, [rows]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Material adjustments</h1>
          <p className="text-sm text-gray-600 mt-1">
            Audit log of manual stock changes (FIFO-safe).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/materials" className="text-sm text-gray-600 underline">
            Back to materials
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 underline">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search material name or reason…"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sm:col-span-1 grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-white px-3 py-2">
            <div className="text-xs text-gray-600">Added</div>
            <div className="text-sm font-semibold">{totals.added}</div>
          </div>
          <div className="rounded-md border bg-white px-3 py-2">
            <div className="text-xs text-gray-600">Removed</div>
            <div className="text-sm font-semibold">{totals.removed}</div>
          </div>
        </div>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-600">No adjustments yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Material</th>
                <th className="px-4 py-3 font-semibold">Change</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">User</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const changeLabel = r.qty_change > 0 ? `+${r.qty_change}` : `${r.qty_change}`;
                const changeClass =
                  r.qty_change > 0 ? "text-emerald-700" : "text-rose-700";

                return (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">{r.material_name}</td>
                    <td className={`px-4 py-3 font-semibold ${changeClass}`}>{changeLabel}</td>
                    <td className="px-4 py-3">{r.reason}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {r.created_by ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
