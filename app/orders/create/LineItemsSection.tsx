
// pacaprints-ops/app/orders/create/LineItemsSection.tsx

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
    onChange(value.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function addLine() {
    onChange([...(value ?? []), makeBlank()]);
  }

  function removeLine(key: string) {
    const next = (value ?? []).filter((v) => v.key !== key);
    onChange(next.length ? next : [makeBlank()]);
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">Line items</div>
          <div className="mt-1 text-xs text-gray-500">
            Add a product name + recipe for FIFO costing.
          </div>
        </div>

        <button
          type="button"
          onClick={addLine}
          className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-900"
        >
          + Add line
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {(value ?? []).map((line, idx) => (
          <div
            key={line.key}
            className="rounded-xl border bg-white p-3"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
              {/* Product name (free text, suggest from existing products) */}
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product name
                </label>
                <input
                  list="product_name_suggestions"
                  type="text"
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  placeholder="e.g. Derek Valentine Card"
                  value={line.product_name ?? ""}
                  onChange={(e) =>
                    update(line.key, { product_name: e.target.value })
                  }
                />
              </div>

              {/* Recipe */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Recipe
                </label>
                <select
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  value={line.recipe_id ?? ""}
                  onChange={(e) =>
                    update(line.key, { recipe_id: e.target.value || null })
                  }
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Qty
                </label>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  value={line.quantity ?? 1}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    update(line.key, {
                      quantity: Number.isFinite(n) && n > 0 ? n : 1,
                    });
                  }}
                />
              </div>

              {/* Remove */}
              <div className="sm:col-span-1 flex sm:justify-end">
                <button
                  type="button"
                  onClick={() => removeLine(line.key)}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-900"
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

      {/* Suggestions list */}
      <datalist id="product_name_suggestions">
        {productNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
