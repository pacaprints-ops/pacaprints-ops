"use client";

import { useEffect, useMemo } from "react";

type Option = { id: string; name: string };

export type OrderLineItemDraft = {
  key: string;
  product_name: string;
  recipe_id: string | null;
  quantity: number;
};

function makeKey() {
  // avoid crypto issues in some environments
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function makeBlank(): OrderLineItemDraft {
  return {
    key: makeKey(),
    product_name: "",
    recipe_id: null,
    quantity: 1,
  };
}

export default function LineItemsSection({
  products,
  recipes,
  value,
  onChange,
}: {
  products: Option[];
  recipes: Option[];
  value: OrderLineItemDraft[];
  onChange: (next: OrderLineItemDraft[]) => void;
}) {
  const productNames = useMemo(
    () => (products ?? []).map((p) => p.name).filter(Boolean),
    [products]
  );

  // Always ensure at least 1 editable row exists
  useEffect(() => {
    if (!value || value.length === 0) onChange([makeBlank()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patch(key: string, next: Partial<OrderLineItemDraft>) {
    onChange((value ?? []).map((row) => (row.key === key ? { ...row, ...next } : row)));
  }

  function addLine() {
    onChange([...(value ?? []), makeBlank()]);
  }

  function removeLine(key: string) {
    const next = (value ?? []).filter((r) => r.key !== key);
    onChange(next.length ? next : [makeBlank()]);
  }

  return (
    <section className="pp-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">Line items</div>
          <div className="mt-1 text-xs text-slate-600">Add product name + recipe for FIFO costing.</div>
        </div>

        <button type="button" onClick={addLine} className="pp-btn pp-btn-secondary">
          + Add line
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {(value ?? []).map((row, idx) => (
          <div key={row.key} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
              {/* Product name */}
              <div className="md:col-span-6 relative z-10">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product name
                </label>
                <input
                  list="pp_product_name_suggestions"
                  type="text"
                  className="pp-input pointer-events-auto"
                  placeholder="e.g. Derek Valentine Card"
                  value={row.product_name ?? ""}
                  onChange={(e) => patch(row.key, { product_name: e.target.value })}
                  autoComplete="off"
                />
              </div>

              {/* Recipe */}
              <div className="md:col-span-4 relative z-10">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipe</label>
                <select
                  className="pp-select pointer-events-auto"
                  value={row.recipe_id ?? ""}
                  onChange={(e) => patch(row.key, { recipe_id: e.target.value || null })}
                >
                  <option value="">Select…</option>
                  {(recipes ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qty */}
              <div className="md:col-span-1 relative z-10">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  className="pp-input pointer-events-auto"
                  value={Number.isFinite(Number(row.quantity)) ? row.quantity : 1}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    patch(row.key, { quantity: Number.isFinite(n) && n > 0 ? n : 1 });
                  }}
                  onWheel={(e) => {
                    // prevent scroll wheel changing qty while scrolling
                    (e.currentTarget as HTMLInputElement).blur();
                  }}
                />
              </div>

              {/* Remove */}
              <div className="md:col-span-1 flex md:justify-end relative z-10">
                <button
                  type="button"
                  onClick={() => removeLine(row.key)}
                  className="pp-btn"
                  aria-label={`Remove line ${idx + 1}`}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <datalist id="pp_product_name_suggestions">
        {productNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </section>
  );
}
