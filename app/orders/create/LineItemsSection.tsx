
"use client";

import { useMemo } from "react";

type Option = { id: string; name: string };

export type OrderLineItemDraft = {
  key: string;
  product_name: string;
  recipe_id: string | null;
  quantity: number;
};

function makeKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
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

  function update(key: string, patch: Partial<OrderLineItemDraft>) {
    onChange((value ?? []).map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function addLine() {
    const next = [...(value ?? [])];
    next.push(makeBlank());
    onChange(next);
  }

  function removeLine(key: string) {
    const next = (value ?? []).filter((v) => v.key !== key);
    onChange(next.length ? next : [makeBlank()]);
  }

  // If parent passes empty array, show one blank row by default
  const linesToRender = (value?.length ?? 0) > 0 ? value : [makeBlank()];

  return (
    <div className="pp-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">Line items</div>
          <div className="mt-1 text-xs text-slate-600">
            Add a product name + recipe for FIFO costing.
          </div>
        </div>

        <button type="button" onClick={addLine} className="pp-btn pp-btn-secondary">
          + Add line
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {linesToRender.map((line, idx) => (
          <div key={line.key} className="pp-card p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
              {/* Product name */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Product name
                </label>
                <input
                  list="product_name_suggestions"
                  type="text"
                  className="pp-input w-full"
                  placeholder="e.g. Derek Valentine Card"
                  value={line.product_name ?? ""}
                  onChange={(e) => update(line.key, { product_name: e.target.value })}
                />
              </div>

              {/* Recipe */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Recipe
                </label>
                <select
                  className="pp-select w-full"
                  value={line.recipe_id ?? ""}
                  onChange={(e) => update(line.key, { recipe_id: e.target.value || null })}
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
              <div className="sm:col-span-1">
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  // Key fix: width + smaller padding so digits are visible even with spinner buttons
                  className="pp-input w-[92px] min-w-[92px] px-2 text-center tabular-nums text-slate-900"
                  value={Number.isFinite(line.quantity) && line.quantity > 0 ? line.quantity : 1}
                  onWheel={(e) => {
                    // prevent accidental scroll-wheel changes
                    (e.target as HTMLInputElement).blur();
                  }}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    update(line.key, { quantity: Number.isFinite(n) && n > 0 ? n : 1 });
                  }}
                />
              </div>

              {/* Remove */}
              <div className="sm:col-span-1 flex sm:justify-end">
                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  className="pp-btn pp-btn-secondary"
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

      <datalist id="product_name_suggestions">
        {productNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
