"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function OrderFlagsQuickToggle({
  orderId,
  isSettled,
  isRefunded,
  refundNotes,
}: {
  orderId: string;
  isSettled: boolean;
  isRefunded: boolean;
  refundNotes: string | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [localSettled, setLocalSettled] = useState(!!isSettled);
  const [localRefunded, setLocalRefunded] = useState(!!isRefunded);

  async function save(nextSettled: boolean, nextRefunded: boolean) {
    setSaving(true);

    // optimistic
    setLocalSettled(nextSettled);
    setLocalRefunded(nextRefunded);

    const { error } = await supabase.rpc("set_order_flags", {
      p_order_id: orderId,
      p_is_settled: nextSettled,
      p_is_refunded: nextRefunded,
      p_refund_notes: nextRefunded ? (refundNotes ?? null) : null,
    });

    setSaving(false);

    if (error) {
      // revert if fails
      setLocalSettled(!!isSettled);
      setLocalRefunded(!!isRefunded);
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={saving}
        onClick={() => save(!localSettled, localRefunded)}
        className={`rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-60 ${
          localSettled ? "bg-green-600 text-white border-green-600" : "bg-white"
        }`}
        title="Toggle settled"
      >
        {localSettled ? "✓ Settled" : "Settled"}
      </button>

      <button
        type="button"
        disabled={saving}
        onClick={() => save(localSettled, !localRefunded)}
        className={`rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-60 ${
          localRefunded ? "bg-red-600 text-white border-red-600" : "bg-white"
        }`}
        title="Toggle refunded"
      >
        {localRefunded ? "Refunded" : "Refund"}
      </button>
    </div>
  );
}
