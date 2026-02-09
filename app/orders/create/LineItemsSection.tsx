"use client";

import * as React from "react";

type Option = {
  id: string;
  name: string;
};

export type OrderLineItemDraft = {
  key: string;
  product_name: string;
  recipe_id: string | null;
  quantity: number;
};


function makeKey() {
  // stable enough for UI; avoids bringing in uuid dependency
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function LineItemsSection({
  products,
  recipes,
  value,
  onChange,
}: {
  products: Option[];
  recipes: Option[];
  value?: OrderLineItemDraft[]; // optional controlled usage later
  onChange?: (lines: OrderLineItemDraft[]) => void; // optional hook for wiring save later
}) {
  const [lines, setLines] = React.useState<OrderLineItemDraft[]>(
    value && value.length
      ? value
      : [
          {
            key: makeKey(),
            product_id: null,
            recipe_id: null,
            quantity: 1,
          },
        ]
  );

  // If parent passes value later, keep in sync (optional)
  React.useEffect(() => {
    if (value) setLines(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  const emit = React.useCallback(
    (next: OrderLineItemDraft[]) => {
      setLines(next);
      onChange?.(next);
    },
    [onChange]
  );

  const addLine = () => {
    emit([
      ...lines,
      { key: makeKey(), product_id: null, recipe_id: null, quantity: 1 },
    ]);
  };

  const removeLine = (key: string) => {
    if (lines.length === 1) return; // keep at least one row
    emit(lines.filter((l) => l.key !== key));
  };

  const updateLine = (key: string, patch: Partial<OrderLineItemDraft>) => {
    emit(
      lines.map((l) => (l.key === key ? { ...l, ...patch } : l))
    );
  };

  return (
    <section className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Line items</h2>

        <button
          type="button"
          onClick={addLine}
          className="rounded-md border px-3 py-2 text-sm font-medium"
        >
          + Add line
        </button>
      </div>

      <div className="space-y-4">
        {lines.map((line, idx) => (
          <div
            key={line.key}
            className="rounded-lg border p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Item {idx + 1}</div>

              <button
                type="button"
                onClick={() => removeLine(line.key)}
                disabled={lines.length === 1}
                className="text-sm rounded-md border px-2 py-1 disabled:opacity-50"
                aria-disabled={lines.length === 1}
              >
                Remove
              </button>
            </div>

            {/* Mobile-first: stacked fields */}
            <div className="space-y-3">
             <label className="block">
  <span className="block text-sm mb-1">Product (reporting)</span>
  <input
  type="text"
  list="product-names"
  placeholder="Start typing…"
  className="w-full rounded-md border px-3 py-2"
  value={line.product_name ?? ""}
  onChange={(e) =>
    updateLine(line.key, {
      product_name: e.target.value,
    })
  }
/>

<datalist id="product-names">
  {products.map((p) => (
    <option key={p.id} value={p.name} />
  ))}
</datalist>

</label>

              <label className="block">
                <span className="block text-sm mb-1">Recipe (costing/stock)</span>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={line.recipe_id ?? ""}
                  onChange={(e) =>
                    updateLine(line.key, {
                      recipe_id: e.target.value || null,
                    })
                  }
                >
                  <option value="">Select recipe…</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm mb-1">Quantity</span>
                <input
                  className="w-full rounded-md border px-3 py-2"
                  type="number"
                  min={1}
                  step={1}
                  value={Number.isFinite(line.quantity) ? line.quantity : 1}
                  onChange={(e) => {
                    const n = parseInt(e.target.value || "1", 10);
                    updateLine(line.key, { quantity: Number.isNaN(n) ? 1 : n });
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* (Optional debug, safe to remove anytime) */}
      {/* <pre className="text-xs opacity-60">{JSON.stringify(lines, null, 2)}</pre> */}
    </section>
  );
}
