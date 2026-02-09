"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import AdjustMaterialModal from "./AdjustMaterialModal";

type MaterialRow = {
  material_id: string;
  material_name: string;
  supplier: string | null;
  last_ordered: string | null;
  total_qty: number;
  avg_cost: number | null;
  stock_value: number;
  reorder_level: number | null;
  status: "in_stock" | "low" | "out";
};

type BatchRow = {
  batch_id: string;
  created_at: string;
  purchase_date: string | null;
  supplier: string | null;
  remaining_quantity: number;
  cost_per_unit: number;
  batch_value: number;
};

function fmtGBP(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number.isFinite(n) ? n : 0
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB");
  } catch {
    return "—";
  }
}

export default function MaterialsPage() {
  const [rows, setRows] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [batches, setBatches] = useState<Record<string, BatchRow[]>>({});
  const [batchesLoading, setBatchesLoading] = useState<Record<string, boolean>>({});

  // Inline reorder edit state
  const [editReorderId, setEditReorderId] = useState<string | null>(null);
  const [editReorderValue, setEditReorderValue] = useState<string>("");
  const [reorderSaving, setReorderSaving] = useState<Record<string, boolean>>({});

  async function refreshMaterials() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.rpc("list_materials_summary", {
      p_search: search.trim() || null,
    });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as MaterialRow[]);
    setLoading(false);
  }

  useEffect(() => {
    refreshMaterials().catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load materials");
      setRows([]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const counts = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.total += 1;
        if (r.status === "out") acc.out += 1;
        else if (r.status === "low") acc.low += 1;
        else acc.in += 1;
        acc.stockValue += r.stock_value || 0;
        return acc;
      },
      { total: 0, in: 0, low: 0, out: 0, stockValue: 0 }
    );
  }, [rows]);

  async function fetchBatches(materialId: string) {
    setBatchesLoading((prev) => ({ ...prev, [materialId]: true }));
    const { data, error } = await supabase.rpc("list_material_batches", {
      p_material_id: materialId,
    });
    setBatchesLoading((prev) => ({ ...prev, [materialId]: false }));

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setBatches((prev) => ({ ...prev, [materialId]: (data ?? []) as BatchRow[] }));
  }

  function toggleExpand(materialId: string) {
    if (expandedId === materialId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(materialId);

    // fetch once
    if (batches[materialId]) return;

    fetchBatches(materialId).catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load batches");
    });
  }

  function startEditReorder(r: MaterialRow) {
    setErrorMsg("");
    setEditReorderId(r.material_id);
    setEditReorderValue(r.reorder_level === null || r.reorder_level === undefined ? "" : String(r.reorder_level));
  }

  function cancelEditReorder() {
    setEditReorderId(null);
    setEditReorderValue("");
  }

  async function saveReorder(materialId: string) {
    setErrorMsg("");
    setReorderSaving((prev) => ({ ...prev, [materialId]: true }));

    // allow blank => null
    const trimmed = editReorderValue.trim();
    const valueToSend = trimmed === "" ? null : Number(trimmed);

    if (valueToSend !== null && !Number.isFinite(valueToSend)) {
      setReorderSaving((prev) => ({ ...prev, [materialId]: false }));
      setErrorMsg("Reorder level must be a number (or blank to clear).");
      return;
    }

    const { error } = await supabase.rpc("set_material_reorder_level", {
      p_material_id: materialId,
      p_reorder_level: valueToSend,
    });

    setReorderSaving((prev) => ({ ...prev, [materialId]: false }));

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setEditReorderId(null);
    setEditReorderValue("");

    await refreshMaterials();

    // If expanded, refresh its batches too (nice + consistent with your adjust)
    if (expandedId === materialId) {
      await fetchBatches(materialId);
    }
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Raw Materials</h1>

        <div className="flex items-center gap-3">
          <Link href="/materials/adjustments" className="text-sm text-gray-600 underline">
            Adjustment log
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 underline">
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search materials…"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Stock value</label>
          <div className="rounded-md border bg-white px-3 py-2 text-sm font-semibold">
            {fmtGBP(counts.stockValue)}
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-sm">
        <span className="rounded-md border bg-white px-3 py-2">
          Total: <strong>{counts.total}</strong>
        </span>
        <span className="rounded-md border bg-white px-3 py-2">
          In stock: <strong>{counts.in}</strong>
        </span>
        <span className="rounded-md border bg-white px-3 py-2">
          Low: <strong>{counts.low}</strong>
        </span>
        <span className="rounded-md border bg-white px-3 py-2">
          Out: <strong>{counts.out}</strong>
        </span>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-gray-600">No materials found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Material</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Avg £/unit</th>
                <th className="px-4 py-3 font-semibold">Stock value</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Reorder level</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Batches</th>
                <th className="px-4 py-3 font-semibold">Adjust</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isOpen = expandedId === r.material_id;
                const list = batches[r.material_id] ?? [];
                const isBatchLoading = !!batchesLoading[r.material_id];

                const isEditing = editReorderId === r.material_id;
                const savingThis = !!reorderSaving[r.material_id];

                return (
                  <Fragment key={r.material_id}>
                    <tr className="border-b">
                      <td className="px-4 py-3">{r.material_name}</td>
                      <td className="px-4 py-3">{r.total_qty}</td>
                      <td className="px-4 py-3">{r.avg_cost === null ? "—" : fmtGBP(r.avg_cost)}</td>
                      <td className="px-4 py-3">{fmtGBP(r.stock_value)}</td>
                      <td className="px-4 py-3">{r.supplier ?? "—"}</td>

                      {/* Inline reorder edit */}
                      <td className="px-4 py-3">
                        {!isEditing ? (
                          <div className="flex items-center gap-2">
                            <span>{r.reorder_level ?? "—"}</span>
                            <button
                              type="button"
                              className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                              onClick={() => startEditReorder(r)}
                              title="Edit reorder level"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="number"
                              step="0.001"
                              className="w-28 rounded-md border bg-white px-2 py-1 text-sm"
                              value={editReorderValue}
                              onChange={(e) => setEditReorderValue(e.target.value)}
                              placeholder="—"
                            />
                            <button
                              type="button"
                              className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                              onClick={() => saveReorder(r.material_id)}
                              disabled={savingThis}
                            >
                              {savingThis ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-gray-50"
                              onClick={cancelEditReorder}
                              disabled={savingThis}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">{r.status}</td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-sm"
                          onClick={() => toggleExpand(r.material_id)}
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <AdjustMaterialModal
                          materialId={r.material_id}
                          materialName={r.material_name}
                          onDone={async () => {
                            await refreshMaterials();
                            if (expandedId === r.material_id) {
                              await fetchBatches(r.material_id);
                            }
                          }}
                        />
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b last:border-b-0">
                        <td colSpan={9} className="px-4 py-3 bg-gray-50">
                          {isBatchLoading ? (
                            <div className="text-sm text-gray-600">Loading batches…</div>
                          ) : list.length === 0 ? (
                            <div className="text-sm text-gray-600">No active batches.</div>
                          ) : (
                            <div className="overflow-x-auto rounded-md border bg-white">
                              <table className="min-w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                  <tr className="text-left">
                                    <th className="px-3 py-2 font-semibold">FIFO order</th>
                                    <th className="px-3 py-2 font-semibold">Purchase date</th>
                                    <th className="px-3 py-2 font-semibold">Supplier</th>
                                    <th className="px-3 py-2 font-semibold">Qty remaining</th>
                                    <th className="px-3 py-2 font-semibold">£/unit</th>
                                    <th className="px-3 py-2 font-semibold">Batch value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {list.map((b, idx) => (
                                    <tr key={b.batch_id} className="border-b last:border-b-0">
                                      <td className="px-3 py-2">
                                        {idx === 0 ? "Oldest (used first)" : idx + 1}
                                      </td>
                                      <td className="px-3 py-2">{fmtDate(b.purchase_date ?? b.created_at)}</td>
                                      <td className="px-3 py-2">{b.supplier ?? "—"}</td>
                                      <td className="px-3 py-2">{b.remaining_quantity}</td>
                                      <td className="px-3 py-2">{fmtGBP(b.cost_per_unit)}</td>
                                      <td className="px-3 py-2">{fmtGBP(b.batch_value)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">Manual adjustments are FIFO-safe.</p>
    </main>
  );
}

