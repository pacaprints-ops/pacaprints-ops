"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type RecipeRow = {
  recipe_id: string;
  recipe_name: string;
  starred: boolean;
  created_at: string;
  material_count: number;
  recipe_cost: number;
  has_low_stock: boolean;
  is_manual: boolean;
  manual_cost: number | null;
};

type RecipeMatRow = {
  recipe_material_id: string;
  material_id: string;
  material_name: string;
  qty_required: number;
  avg_cost: number;
  line_cost: number;
  total_qty: number;
  status: string; // "in_stock" | "low" | "out"
};

function fmtGBP(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    Number.isFinite(n) ? n : 0
  );
}

type SortMode = "az" | "cost_desc" | "cost_asc";

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

export default function RecipesPage() {
  const [rows, setRows] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("az");

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mats, setMats] = useState<Record<string, RecipeMatRow[]>>({});
  const [matsLoading, setMatsLoading] = useState<Record<string, boolean>>({});

  async function refresh() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.rpc("list_recipes_summary", {
      p_search: search.trim() || null,
    });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as RecipeRow[]);
    setLoading(false);
  }

  useEffect(() => {
    refresh().catch((e) => {
      setErrorMsg(e?.message ?? "Failed to load recipes");
      setRows([]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const viewRows = useMemo(() => {
    const copied = [...rows];

    copied.sort((a, b) => {
      // starred always first
      if (a.starred !== b.starred) return a.starred ? -1 : 1;

      if (sortMode === "az") return a.recipe_name.localeCompare(b.recipe_name);
      if (sortMode === "cost_desc") return (b.recipe_cost || 0) - (a.recipe_cost || 0);
      if (sortMode === "cost_asc") return (a.recipe_cost || 0) - (b.recipe_cost || 0);
      return 0;
    });

    return copied;
  }, [rows, sortMode]);

  const totals = useMemo(() => {
    return viewRows.reduce(
      (acc, r) => {
        acc.count += 1;
        acc.starred += r.starred ? 1 : 0;
        acc.lowFlag += r.has_low_stock ? 1 : 0;
        acc.manual += r.is_manual ? 1 : 0;
        return acc;
      },
      { count: 0, starred: 0, lowFlag: 0, manual: 0 }
    );
  }, [viewRows]);

  async function toggleExpand(recipeId: string, isManual: boolean) {
    // manual recipes have no ingredients list
    if (isManual) {
      setExpandedId(expandedId === recipeId ? null : recipeId);
      return;
    }

    if (expandedId === recipeId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(recipeId);

    if (mats[recipeId]) return;

    setMatsLoading((prev) => ({ ...prev, [recipeId]: true }));
    const { data, error } = await supabase.rpc("list_recipe_materials", {
      p_recipe_id: recipeId,
    });
    setMatsLoading((prev) => ({ ...prev, [recipeId]: false }));

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setMats((prev) => ({ ...prev, [recipeId]: (data ?? []) as RecipeMatRow[] }));
  }

  async function toggleStar(recipeId: string, newValue: boolean) {
    setErrorMsg("");

    // optimistic UI
    setRows((prev) => prev.map((r) => (r.recipe_id === recipeId ? { ...r, starred: newValue } : r)));

    const { error } = await supabase.from("recipes").update({ starred: newValue }).eq("id", recipeId);

    if (error) {
      // revert if failed
      setRows((prev) => prev.map((r) => (r.recipe_id === recipeId ? { ...r, starred: !newValue } : r)));
      setErrorMsg(error.message);
    }
  }

  function exportCSV() {
    const header = ["Recipe", "Type", "Starred", "Cost", "Materials", "Low stock flag"];
    const lines = viewRows.map((r) => [
      r.recipe_name,
      r.is_manual ? "manual" : "materials",
      r.starred ? "yes" : "no",
      String(r.recipe_cost ?? 0),
      String(r.material_count ?? 0),
      r.has_low_stock ? "yes" : "no",
    ]);

    downloadCSV(`recipes_${new Date().toISOString().slice(0, 10)}.csv`, [header, ...lines]);
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Recipes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create and maintain recipes so order costing stays correct (including manual-cost recipes for older orders).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/recipes/new" className="text-sm rounded-md border bg-white px-3 py-2 hover:bg-gray-50">
            New recipe
          </Link>
          <Link href="/materials" className="text-sm text-gray-600 underline">
            Materials
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-600 underline">
            Dashboard
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search recipes…"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">Sort</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm bg-white"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="az">A → Z</option>
            <option value="cost_desc">Cost (high → low)</option>
            <option value="cost_asc">Cost (low → high)</option>
          </select>
        </div>

        <div className="sm:col-span-1 flex items-end">
          <button
            type="button"
            className="w-full rounded-md border bg-white px-3 py-2 text-sm hover:bg-gray-50"
            onClick={exportCSV}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="mb-3 flex flex-wrap gap-3 text-sm">
        <span className="rounded-md border bg-white px-3 py-2">
          Total: <strong>{totals.count}</strong>
        </span>
        <span className="rounded-md border bg-white px-3 py-2">
          Starred: <strong>{totals.starred}</strong>
        </span>
        <span className="rounded-md border bg-white px-3 py-2">
          Manual: <strong>{totals.manual}</strong>
        </span>
        <span className="rounded-md border bg-white px-3 py-2">
          Low-stock flags: <strong>{totals.lowFlag}</strong>
        </span>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
      ) : null}

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : viewRows.length === 0 ? (
        <div className="text-sm text-gray-600">No recipes found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">★</th>
                <th className="px-4 py-3 font-semibold">Recipe</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Materials</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Details</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {viewRows.map((r) => {
                const isOpen = expandedId === r.recipe_id;
                const list = mats[r.recipe_id] ?? [];
                const isMatsLoading = !!matsLoading[r.recipe_id];

                return (
                  <Fragment key={r.recipe_id}>
                    <tr className="border-b">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(r.recipe_id, !r.starred);
                          }}
                          title={r.starred ? "Unstar" : "Star"}
                        >
                          {r.starred ? "★" : "☆"}
                        </button>
                      </td>

                      <td className="px-4 py-3">{r.recipe_name}</td>

                      <td className="px-4 py-3">
                        {r.is_manual ? (
                          <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-1 text-xs text-gray-700">
                            Manual
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border bg-white px-2 py-1 text-xs text-gray-700">
                            Materials
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 font-semibold">{fmtGBP(r.recipe_cost || 0)}</td>
                      <td className="px-4 py-3">{r.material_count}</td>

                      <td className="px-4 py-3">
                        {r.is_manual ? (
                          <span className="text-sm text-gray-600">—</span>
                        ) : r.has_low_stock ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border bg-red-50 text-red-700 font-semibold">
                              !
                            </span>
                            <span className="text-sm text-red-700">Check stock</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">OK</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-sm"
                          onClick={() => toggleExpand(r.recipe_id, r.is_manual)}
                        >
                          {isOpen ? "Hide" : "View"}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          href={`/recipes/${r.recipe_id}/edit`}
                          className="text-sm text-gray-600 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b last:border-b-0">
                        <td colSpan={8} className="px-4 py-3 bg-gray-50">
                          {r.is_manual ? (
                            <div className="text-sm text-gray-700">
                              Manual recipe (no materials). Cost is set directly.
                              <div className="text-xs text-gray-500 mt-1">
                                Tip: use this for older orders until everything has proper materials.
                              </div>
                            </div>
                          ) : isMatsLoading ? (
                            <div className="text-sm text-gray-600">Loading ingredients…</div>
                          ) : list.length === 0 ? (
                            <div className="text-sm text-gray-600">No ingredients yet.</div>
                          ) : (
                            <div className="overflow-x-auto rounded-md border bg-white">
                              <table className="min-w-full text-sm">
                                <thead className="border-b bg-gray-50">
                                  <tr className="text-left">
                                    <th className="px-3 py-2 font-semibold">Material</th>
                                    <th className="px-3 py-2 font-semibold">Qty required</th>
                                    <th className="px-3 py-2 font-semibold">Avg £/unit</th>
                                    <th className="px-3 py-2 font-semibold">Line cost</th>
                                    <th className="px-3 py-2 font-semibold">In stock</th>
                                    <th className="px-3 py-2 font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {list.map((m) => {
                                    const isWarn =
                                      m.status !== "in_stock" ||
                                      (m.total_qty ?? 0) < (m.qty_required ?? 0);

                                    return (
                                      <tr
                                        key={m.recipe_material_id}
                                        className={`border-b last:border-b-0 ${isWarn ? "bg-red-50" : ""}`}
                                      >
                                        <td className="px-3 py-2">{m.material_name}</td>
                                        <td className="px-3 py-2">{m.qty_required}</td>
                                        <td className="px-3 py-2">{fmtGBP(m.avg_cost || 0)}</td>
                                        <td className="px-3 py-2">{fmtGBP(m.line_cost || 0)}</td>
                                        <td className="px-3 py-2">{m.total_qty ?? 0}</td>
                                        <td className="px-3 py-2">{m.status}</td>
                                      </tr>
                                    );
                                  })}
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
        Next: Update New + Edit recipe pages to support “Manual cost” toggle + materials picker.
      </p>
    </main>
  );
}
