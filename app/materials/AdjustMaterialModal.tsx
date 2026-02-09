"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  materialId: string;
  materialName: string;
  onDone?: () => void; // call this after saving so the page can refresh/reload data
};

export default function AdjustMaterialModal({ materialId, materialName, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState<string>("");
  const [mode, setMode] = useState<"add" | "remove">("remove");
  const [reason, setReason] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function submit() {
    setErrorMsg("");

    const n = Number(qty);
    if (!qty || Number.isNaN(n) || n <= 0) {
      return setErrorMsg("Enter a quantity greater than 0.");
    }
    if (!reason.trim()) {
      return setErrorMsg("Reason is required.");
    }

    const qtyChange = mode === "add" ? n : -n;

    setSaving(true);
    const { error } = await supabase.rpc("apply_material_adjustment", {
      p_material_id: materialId,
      p_qty_change: qtyChange,
      p_reason: reason.trim(),
    });
    setSaving(false);

    if (error) return setErrorMsg(error.message);

    // reset + close
    setQty("");
    setReason("");
    setMode("remove");
    setOpen(false);

    onDone?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "6px 10px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "white",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Adjust
      </button>

      {open ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
          onClick={() => !saving && setOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "white",
              borderRadius: 16,
              padding: 14,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Adjust stock</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>
                  {materialName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                style={{
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Type
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as "add" | "remove")}
                  disabled={saving}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "white",
                  }}
                >
                  <option value="remove">Remove stock (waste/damage)</option>
                  <option value="add">Add stock (found/extra)</option>
                </select>
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Quantity
                <input
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 5"
                  disabled={saving}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                  }}
                />
              </label>

              <label style={{ fontSize: 13, fontWeight: 600 }}>
                Reason
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. damaged, miscount, found stock"
                  disabled={saving}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                  }}
                />
              </label>

              {errorMsg ? (
                <div style={{ color: "crimson", fontSize: 13 }}>{errorMsg}</div>
              ) : null}

              <button
                type="button"
                onClick={submit}
                disabled={saving}
                style={{
                  marginTop: 4,
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "none",
                  background: "#0f172a",
                  color: "white",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : "Save adjustment"}
              </button>

              <div style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.4 }}>
                Removing stock is FIFO-safe (oldest batches first). Adds create a new batch.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
