"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type Material = { id: string; name: string };

type Line = {
  material_id: string;
  material_name: string;
  quantity: string;
};

export default function EditRecipePage() {
  const params = useParams<{ id: string }>();
  const recipeId = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [starred, setStarred] = useState(false);

  // Manual recipe support
  const [isManual, setIsManual] = useState(false);
  const [manualCost, setManualCost] = useState<string>("");

  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");

  const [lines, setLines] = useState<Line[]>([
    { material_id: "", material_name: "", quantity: "" },
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return materials.slice(0, 50);
    return materials.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 50);
  }, [materials, search]);

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const addLine = () =>
    setLines((prev) => [...prev, { material_id: "", material_name: "", quantity: "" }]);

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const chooseMaterial = (idx: number, m: Material) => {
    setLine(idx, { material_id: m.id, material_name: m.name });
    setSearch("");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        // 1) materials lookup for picker
        const { data: mats, error: matsErr } = await supabase.rpc("list_materials_lookup", {
          p_search: null,
        });
        if (matsErr) throw matsErr;
        setMaterials((mats ?? []) as Material[]);

        // 2) header (now includes is_manual/manual_cost)
        const { data: header, error: headErr } = await supabase.rpc("get_recipe_header", {
          p_recipe_id: recipeId,
        });
        if (headErr) throw headErr;

        const h = (Array.isArray(header) ? header[0] : header) as any;
        setName(String(h?.name ?? ""));
        setStarred(Boolean(h?.starred ?? false));
        setIsManual(Boolean(h?.is_manual ?? false));
        setManualCost(
          h?.manual_cost === null || h?.manual_cost === undefined ? "" : String(h.manual_cost)
        );

        // 3) only load recipe materials if NOT manual
        if (Boolean(h?.is_manual ?? false)) {
          setLines([{ material_id: "", material_name: "", quantity: "" }]);
          setLoading(false);
          return;
        }

        const { data: rm, error: rmErr } = await supabase.rpc("list_recipe_materials", {
          p_recipe_id: recipeId,
        });
        if (rmErr) throw rmErr;

        const rows = (rm ?? []) as any[];
        if (!rows.length) {
          setLines([{ material_id: "", material_name: "", quantity: "" }]);
        } else {
          setLines(
            rows.map((r) => ({
              material_id: String(r.material_id),
              material_name: String(r.material_name ?? ""),
              quantity: String(r.qty_required ?? r.quantity ?? ""),
            }))
          );
        }

        setLoading(false);
      } catch (e: any) {
        setErrorMsg(e?.message ?? "Failed to load recipe");
        setLoading(false);
      }
    };

    if (recipeId) load();
  }, [recipeId]);

  const onSave = async () => {
    setErrorMsg("");

    const cleanName = name.trim();
    if (!cleanName) return setErrorMsg("Recipe name is required.");

    // Manual mode save
    if (isManual) {
      const costNum = Number(manualCost);
      if (!Number.isFinite(costNum) || costNum < 0) {
        return setErrorMsg("Manual cost must be a valid number (0 or more).");
      }

      setSaving(true);
      const { error } = await supabase.rpc("update_recipe_v2", {
        p_recipe_id: recipeId,
        p_name: cleanName,
        p_starred: starred,
        p_is_manual: true,
        p_manual_cost: costNum,
        p_items: [],
      });
      setSaving(false);

      if (error) return setErrorMsg(error.message);

      router.push("/recipes");
      router.refresh();
      return;
    }

    // Materials mode save
    const items = lines
      .map((l) => ({
        material_id: l.material_id,
        quantity: Number(l.quantity),
      }))
      .filter((x) => x.material_id && Number.isFinite(x.quantity) && x.quantity > 0);

    if (items.length === 0) return setErrorMsg("Add at least 1 material with a quantity.");

    setSaving(true);

    const { error } = await supabase.rpc("update_recipe_v2", {
      p_recipe_id: recipeId,
      p_name: cleanName,
      p_starred: starred,
      p_is_manual: false,
      p_manual_cost: null,
      p_items: items,
    });

    setSaving(false);

    if (error) return setErrorMsg(error.message);

    router.push("/recipes");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <div className="text-sm text-gray-600">Loading…</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit recipe</h1>
          <p className="text-sm text-gray-600 mt-1">
            Update materials + quantities, or switch to manual cost.
          </p>
        </div>
        <Link href="/recipes" className="text-sm text-gray-600 underline">
          Back to recipes
        </Link>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
      ) : null}

      <section className="rounded-lg border bg-white p-4 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Recipe name</label>
            <input
              className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={starred}
                onChange={(e) => setStarred(e.target.checked)}
              />
              Star recipe
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isManual}
                onChange={(e) => setIsManual(e.target.checked)}
              />
              Manual cost recipe (no materials)
            </label>
          </div>

          {isManual ? (
            <div className="rounded-md border bg-gray-50 p-3">
              <div className="text-sm font-semibold text-gray-900">Manual cost</div>
              <div className="mt-2">
                <input
                  type="number"
                  step="0.0001"
                  className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                  value={manualCost}
                  onChange={(e) => setManualCost(e.target.value)}
                  placeholder="e.g. 0.65"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Switching to manual clears any saved materials for this recipe.
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {!isManual ? (
          <div className="rounded-md border bg-gray-50 p-3">
            <div className="text-sm font-semibold text-gray-900">Materials</div>

            <div className="mt-3 space-y-3">
              {lines.map((l, idx) => (
                <div key={idx} className="rounded-md border bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">Line {idx + 1}</div>
                    {lines.length > 1 ? (
                      <button
                        type="button"
                        className="text-xs rounded-md border bg-white px-2 py-1 hover:bg-gray-50"
                        onClick={() => removeLine(idx)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-600">Material</label>

                    {l.material_id ? (
                      <div className="flex items-center justify-between gap-2 rounded-md border bg-gray-50 px-3 py-2">
                        <div className="text-sm text-gray-900">{l.material_name || "Selected material"}</div>
                        <button
                          type="button"
                          className="text-xs rounded-md border bg-white px-2 py-1 hover:bg-gray-50"
                          onClick={() => setLine(idx, { material_id: "", material_name: "" })}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search materials…"
                        />

                        <div className="max-h-44 overflow-auto rounded-md border bg-white">
                          {filtered.length === 0 ? (
                            <div className="p-3 text-sm text-gray-600">No matches.</div>
                          ) : (
                            filtered.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0"
                                onClick={() => chooseMaterial(idx, m)}
                              >
                                {m.name}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Quantity</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                      value={l.quantity}
                      onChange={(e) => setLine(idx, { quantity: e.target.value })}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="text-sm rounded-md border bg-white px-3 py-2 hover:bg-gray-50"
                onClick={addLine}
              >
                Add material
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="text-sm rounded-md bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 disabled:opacity-50"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </section>
    </main>
  );
}
