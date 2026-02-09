"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type PurchaseRow = {
  purchase_order_id: string;
  purchase_date: string; // date string
  purchase_number: string | null;
  supplier_id: string;
  supplier_name: string;
  shipping_cost: number;
  items_cost: number;
  total_cost: number;
  item_count: number;
  posted_at: string | null;
};

type PurchaseItemRow = {
  purchase_order_item_id: string;
  material_id: string;
  material_name: string;
  quantity: number;
  line_cost: number;
  unit_cost: number;
  starred: boolean;
  notes: string | null;
};

type MaterialRow = { id: string; name: string };

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

function toNum(s: string) {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

type EditLine = {
  material_id: string;
  quantity: string;
  line_cost: string;
  starred: boolean;
  notes: string;
};

export default function PurchasesPage() {
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, PurchaseItemRow[]>>({});
  const [itemsLoading, setItemsLoading] = useState<Record<string, boolean>>({});
  const [postingId, setPostingId] = useState<string | null>(null);

  // EDIT MODAL STATE
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [editPurchaseDate, setEditPurchaseDate] = useState<string>("");
  const [editPurchaseNumber, setEditPurchaseNumber] = useState<string>("");
  const [editShippingCost, setEditShippingCost] = useState<string>("0");
  const [editLines, setEditLines] = useState<EditLine[]>([
    { material_id: "", quantity: "1", line_cost: "0", starred: false, notes: "" },
  ]);

  async function refresh() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.rpc("list_purchase_orders", {
      p_search: search.trim() || null,
    });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as PurchaseRow[]);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load purchases");
      setRows([]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function fetchItems(purchaseOrderId: string) {
    setItemsLoading((prev) => ({ ...prev, [purchaseOrderId]: true }));

    const { data, error } = await supabase.rpc("list_purchase_order_items", {
      p_purchase_order_id: purchaseOrderId,
    });

    setItemsLoading((prev) => ({ ...prev, [purchaseOrderId]: false }));

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setItems((prev) => ({ ...prev, [purchaseOrderId]: (data ?? []) as PurchaseItemRow[] }));
  }

  function toggleExpand(purchaseOrderId: string) {
    if (expandedId === purchaseOrderId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(purchaseOrderId);

    if (items[purchaseOrderId]) return;

    fetchItems(purchaseOrderId).catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load purchase items");
    });
  }

  async function postToInventory(purchaseOrderId: string) {
    setErrorMsg("");

    const ok = window.confirm(
      "Post this purchase to inventory?\n\nThis will create FIFO batches and can’t be undone from the UI."
    );
    if (!ok) return;

    setPostingId(purchaseOrderId);

    const { error } = await supabase.rpc("post_purchase_order_to_inventory", {
      p_purchase_order_id: purchaseOrderId,
    });

    setPostingId(null);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await refresh();

    if (expandedId === purchaseOrderId) {
      await fetchItems(purchaseOrderId);
    }
  }

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.count += 1;
        acc.totalSpend += r.total_cost || 0;
        acc.posted += r.posted_at ? 1 : 0;
        return acc;
      },
      { count: 0, totalSpend: 0, posted: 0 }
    );
  }, [rows]);

  // -------- EDIT MODAL HELPERS --------

  async function ensureMaterialsLoaded() {
    if (materials.length) return;

    const { data, error } = await supabase.rpc("list_materials_summary", { p_search: null });
    if (error) throw error;

    const safe = ((data ?? []) as any[]).map((r) => ({
      id: r.material_id,
      name: r.material_name,
    })) as MaterialRow[];

    setMaterials(safe);
  }

  async function openEdit(r: PurchaseRow) {
    if (r.posted_at) return;

    setEditOpen(true);
    setEditId(r.purchase_order_id);
    setEditPurchaseDate(r.purchase_date);
    setEditPurchaseNumber(r.purchase_number ?? "");
    setEditShippingCost(String(r.shipping_cost ?? 0));
    setEditLines([{ material_id: "", quantity: "1", line_cost: "0", starred: false, notes: "" }]);

    setEditLoading(true);
    setErrorMsg("");

    try {
      await ensureMaterialsLoaded();
      const { data, error } = await supabase.rpc("list_purchase_order_items", {
        p_purchase_order_id: r.purchase_order_id,
      });
      if (error) throw error;

      const list = (data ?? []) as PurchaseItemRow[];
      setEditLines(
        list.length
          ? list.map((i) => ({
              material_id: i.material_id,
              quantity: String(i.quantity ?? 0),
              line_cost: String(i.line_cost ?? 0),
              starred: !!i.starred,
              notes: i.notes ?? "",
            }))
          : [{ material_id: "", quantity: "1", line_cost: "0", starred: false, notes: "" }]
      );
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to load edit data");
    } finally {
      setEditLoading(false);
    }
  }

  function closeEdit() {
    if (editSaving) return;
    setEditOpen(false);
    setEditId(null);
  }

  // ESC closes modal + stop background scroll while open
  useEffect(() => {
    if (!editOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEdit();
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOpen, editSaving]);

  function updateEditLine(idx: number, patch: Partial<EditLine>) {
    setEditLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function addEditLine() {
    setEditLines((prev) => [
      ...prev,
      { material_id: "", quantity: "1", line_cost: "0", starred: false, notes: "" },
    ]);
  }

  function removeEditLine(idx: number) {
    setEditLines((prev) => prev.filter((_, i) => i !== idx));
  }

  async function saveEdit() {
    if (!editId) return;

    setErrorMsg("");

    if (!editPurchaseDate) {
      setErrorMsg("Purchase date is required.");
      return;
    }

    const payload = editLines
      .map((l) => ({
        material_id: l.material_id,
        quantity: toNum(l.quantity),
        line_cost: toNum(l.line_cost),
        starred: !!l.starred,
        notes: l.notes?.trim() || null,
      }))
      .filter((x) => x.material_id && x.quantity > 0);

    if (payload.length === 0) {
      setErrorMsg("Add at least 1 valid item (material + qty).");
      return;
    }

    setEditSaving(true);

    const { error } = await supabase.rpc("update_purchase_order_unposted", {
      p_purchase_order_id: editId,
      p_purchase_date: editPurchaseDate,
      p_purchase_number: editPurchaseNumber.trim() || null,
      p_shipping_cost: toNum(editShippingCost),
      p_items: payload,
    });

    setEditSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await refresh();
    if (expandedId === editId) await fetchItems(editId);

    closeEdit();
  }

  const editTotals = useMemo(() => {
    const itemsCost = editLines.reduce((sum, l) => sum + toNum(l.line_cost), 0);
    const ship = toNum(editShippingCost);
    return { itemsCost, ship, total: itemsCost + ship };
  }, [editLines, editShippingCost]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-600 mt-1">
            Purchase orders (latest first). Post to inventory to create FIFO batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/purchases/new"
            className="text-sm rounded-md border bg-white px-3 py-2 hover:bg-gray-50"
          >
            Add purchase
          </Link>

          <Link href="/materials" className="text-sm text-gray-600 underline">
            Materials
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 underline">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search supplier, purchase #, or item…"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-[11px] text-gray-500 mt-1">
            Tip: item search matches material name in the purchase.
          </div>
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-white px-3 py-2">
            <div className="text-xs text-gray-600">Orders</div>
            <div className="text-sm font-semibold">
              {totals.count}{" "}
              <span className="text-xs font-normal text-gray-500">
                ({totals.posted} posted)
              </span>
            </div>
          </div>
          <div className="rounded-md border bg-white px-3 py-2">
            <div className="text-xs text-gray-600">Total spend</div>
            <div className="text-sm font-semibold">{fmtGBP(totals.totalSpend)}</div>
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
        <div className="text-sm text-gray-600">No purchase orders yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Purchase #</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Shipping</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Post</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isOpen = expandedId === r.purchase_order_id;
                const list = items[r.purchase_order_id] ?? [];
                const isLoadingItems = !!itemsLoading[r.purchase_order_id];

                const isPosted = !!r.posted_at;
                const isPosting = postingId === r.purchase_order_id;

                return (
                  <Fragment key={r.purchase_order_id}>
                    <tr className="border-b">
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDate(r.purchase_date)}</td>
                      <td className="px-4 py-3">{r.supplier_name}</td>
                      <td className="px-4 py-3">{r.purchase_number ?? "—"}</td>
                      <td className="px-4 py-3">{r.item_count}</td>
                      <td className="px-4 py-3">{fmtGBP(r.shipping_cost)}</td>
                      <td className="px-4 py-3 font-semibold">{fmtGBP(r.total_cost)}</td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {isPosted ? (
                          <div className="text-xs text-gray-600">
                            Posted
                            <div className="text-[11px] text-gray-500">
                              {r.posted_at ? fmtDateTime(r.posted_at) : ""}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="rounded-md border px-3 py-2 text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                            disabled={isPosting}
                            onClick={() => postToInventory(r.purchase_order_id)}
                          >
                            {isPosting ? "Posting…" : "Post"}
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-sm"
                          onClick={() => toggleExpand(r.purchase_order_id)}
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          className="text-sm text-gray-600 underline disabled:opacity-40"
                          disabled={isPosted}
                          onClick={() => openEdit(r)}
                          title={
                            isPosted
                              ? "Posted purchases can’t be edited (inventory already created)."
                              : "Edit"
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b last:border-b-0">
                        <td colSpan={9} className="px-4 py-3 bg-gray-50">
                          {isLoadingItems ? (
                            <div className="text-sm text-gray-600">Loading items…</div>
                          ) : list.length === 0 ? (
                            <div className="text-sm text-gray-600">No items.</div>
                          ) : (
                            <div className="overflow-x-auto rounded-md border bg-white">
                              <table className="min-w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                  <tr className="text-left">
                                    <th className="px-3 py-2 font-semibold">Item</th>
                                    <th className="px-3 py-2 font-semibold">Qty</th>
                                    <th className="px-3 py-2 font-semibold">Line £</th>
                                    <th className="px-3 py-2 font-semibold">£/unit</th>
                                    <th className="px-3 py-2 font-semibold">Star</th>
                                    <th className="px-3 py-2 font-semibold">Notes</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {list.map((i) => (
                                    <tr
                                      key={i.purchase_order_item_id}
                                      className="border-b last:border-b-0"
                                    >
                                      <td className="px-3 py-2">{i.material_name}</td>
                                      <td className="px-3 py-2">{i.quantity}</td>
                                      <td className="px-3 py-2">{fmtGBP(i.line_cost)}</td>
                                      <td className="px-3 py-2">{fmtGBP(i.unit_cost)}</td>
                                      <td className="px-3 py-2">{i.starred ? "★" : "—"}</td>
                                      <td className="px-3 py-2">{i.notes ?? "—"}</td>
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

      <p className="mt-4 text-xs text-gray-500">
        Posting creates FIFO batches in inventory and prevents double-posting. Posted purchases can’t be edited.
      </p>

      {/* EDIT MODAL */}
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeEdit} />

          {/* Smaller + scroll inside */}
          <div className="relative w-full max-w-2xl rounded-lg border bg-white shadow-lg max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-gray-900">Edit purchase</div>
                <div className="text-xs text-gray-500">Only allowed before posting. Press ESC to close.</div>
              </div>
              <button
                type="button"
                className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                onClick={closeEdit}
                disabled={editSaving}
              >
                Close
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-64px)]">
              {editLoading ? (
                <div className="text-sm text-gray-600">Loading…</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="text-sm">
                      <div className="text-xs font-medium text-gray-700 mb-1">Purchase date</div>
                      <input
                        type="date"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={editPurchaseDate}
                        onChange={(e) => setEditPurchaseDate(e.target.value)}
                      />
                    </label>

                    <label className="text-sm">
                      <div className="text-xs font-medium text-gray-700 mb-1">Purchase #</div>
                      <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={editPurchaseNumber}
                        onChange={(e) => setEditPurchaseNumber(e.target.value)}
                        placeholder="Optional"
                      />
                    </label>

                    <label className="text-sm">
                      <div className="text-xs font-medium text-gray-700 mb-1">Shipping £</div>
                      <input
                        inputMode="decimal"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={editShippingCost}
                        onChange={(e) => setEditShippingCost(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="rounded-md border bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">Items</div>
                      <button
                        type="button"
                        className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={addEditLine}
                      >
                        Add item
                      </button>
                    </div>

                    {/* One-row layout + notes under */}
                    <div className="mt-3 space-y-3">
                      {editLines.map((l, idx) => (
                        <div key={idx} className="rounded-md border bg-white p-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                            {/* Material */}
                            <label className="sm:col-span-6">
                              <div className="text-xs font-medium text-gray-700 mb-1">Material</div>
                              <select
                                className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                                value={l.material_id}
                                onChange={(e) => updateEditLine(idx, { material_id: e.target.value })}
                              >
                                <option value="">Select material…</option>
                                {materials.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </label>

                            {/* Qty */}
                            <label className="sm:col-span-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">Qty</div>
                              <input
                                inputMode="decimal"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={l.quantity}
                                onChange={(e) => updateEditLine(idx, { quantity: e.target.value })}
                              />
                            </label>

                            {/* Line £ */}
                            <label className="sm:col-span-2">
                              <div className="text-xs font-medium text-gray-700 mb-1">Line £</div>
                              <input
                                inputMode="decimal"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={l.line_cost}
                                onChange={(e) => updateEditLine(idx, { line_cost: e.target.value })}
                              />
                            </label>

                            {/* Star */}
                            <div className="sm:col-span-1 flex items-end">
                              <button
                                type="button"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                onClick={() => updateEditLine(idx, { starred: !l.starred })}
                                title={l.starred ? "Unstar" : "Star"}
                              >
                                {l.starred ? "★" : "☆"}
                              </button>
                            </div>

                            {/* Delete */}
                            <div className="sm:col-span-1 flex items-end">
                              <button
                                type="button"
                                className="w-full rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                                onClick={() => removeEditLine(idx)}
                                disabled={editLines.length === 1}
                                title="Remove line"
                              >
                                🗑️
                              </button>
                            </div>

                            {/* Notes */}
                            <label className="sm:col-span-12">
                              <div className="text-xs font-medium text-gray-700 mb-1">Notes</div>
                              <input
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                value={l.notes}
                                onChange={(e) => updateEditLine(idx, { notes: e.target.value })}
                                placeholder="Optional line note…"
                              />
                            </label>

                            {/* Unit cost */}
                            <div className="sm:col-span-12 text-xs text-gray-500">
                              Unit cost:{" "}
                              <strong>
                                £
                                {toNum(l.quantity) > 0
                                  ? (toNum(l.line_cost) / toNum(l.quantity)).toFixed(4)
                                  : "0.0000"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-md border bg-white px-3 py-2">
                        <div className="text-xs text-gray-600">Items £</div>
                        <div className="font-semibold">{editTotals.itemsCost.toFixed(2)}</div>
                      </div>
                      <div className="rounded-md border bg-white px-3 py-2">
                        <div className="text-xs text-gray-600">Shipping £</div>
                        <div className="font-semibold">{editTotals.ship.toFixed(2)}</div>
                      </div>
                      <div className="rounded-md border bg-white px-3 py-2">
                        <div className="text-xs text-gray-600">Total £</div>
                        <div className="font-semibold">{editTotals.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                    onClick={saveEdit}
                    disabled={editSaving}
                  >
                    {editSaving ? "Saving…" : "Save changes"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

