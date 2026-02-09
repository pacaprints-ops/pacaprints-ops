
// pacaprints-ops/app/orders/create/LineItemsSection.tsx

"use client";

import { useMemo } from "react";

export type OrderLineItemDraft = {
  key: string;
  recipe_id: string | null;
  quantity: number;
};

type RecipeOption = {
  id: string;
  name: string;
};

function makeKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function LineItemsSection({
  items,
  setItems,
  recipes,
}: {
  items: OrderLineItemDraft[];
  setItems: (next: OrderLineItemDraft[]) => void;
  recipes: RecipeOption[];
}) {
  const recipeOptions = useMemo(() => recipes ?? [], [recipes]);

  function addItem() {
    setItems([
      ...items,
      {
        key: makeKey(),
        recipe_id: null,
        quantity: 1,
      },
    ]);
  }

  function removeItem(key: string) {
    const next = items.filter((x) => x.key !== key);
    setItems(next.length ? next : [{ key: makeKey(), recipe_id: null, quantity: 1 }]);
  }

  function updateItem(key: string, patch: Partial<OrderLineItemDraft>) {
    setItems(items.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  }

  return (
    <div className="pp-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">Line items</div>
          <div className="mt-1 text-xs text-slate-600">
            Add one or more recipes and quantities for this order.
          </div>
        </div>

        <button type="button" className="pp-btn pp-btn-secondary" onClick={addItem}>
          + Add item
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.key}
            className="rounded-2xl bg-white p-4"
            style={{
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipe
                </label>
                <select
                  className="pp-select"
                  value={item.recipe_id ?? ""}
                  onChange={(e) =>
                    updateItem(item.key, { recipe_id: e.target.value || null })
                  }
                >
                  <option value="">Select…</option>
                  {recipeOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  className="pp-input"
                  value={item.quantity}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    updateItem(item.key, { quantity: Number.isFinite(n) && n > 0 ? n : 1 });
                  }}
                />
              </div>

              <div className="sm:col-span-1 flex sm:justify-end">
                <button
                  type="button"
                  className="pp-btn pp-btn-secondary"
                  onClick={() => removeItem(item.key)}
                  aria-label={`Remove line item ${idx + 1}`}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
