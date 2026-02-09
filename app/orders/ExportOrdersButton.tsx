"use client";

type Row = {
  order_no?: number | null;
  order_date: string | null;
  platform: string | null;
  platform_order_ref: string | null;
  items_summary: string | null;
  customer_name: string | null;
  revenue: any;
  shipping_cost: any;
  total_cost: any;
  gross_profit: any;
};

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

export default function ExportOrdersButton({ rows }: { rows: Row[] }) {
  function exportCSV() {
    const header = [
      "Order #",
      "Order date",
      "Platform",
      "Platform ref",
      "Products",
      "Customer",
      "Revenue",
      "Shipping",
      "COGS",
      "Profit",
    ];

    const lines = rows.map((o) => [
      String(o.order_no ?? ""),
      o.order_date ?? "",
      o.platform ?? "",
      o.platform_order_ref ?? "",
      o.items_summary ?? "",
      o.customer_name ?? "",
      String(o.revenue ?? 0),
      String(o.shipping_cost ?? 0),
      String(o.total_cost ?? 0),
      String(o.gross_profit ?? 0),
    ]);

    downloadCSV(`orders_${new Date().toISOString().slice(0, 10)}.csv`, [header, ...lines]);
  }

  return (
    <button
      type="button"
      onClick={exportCSV}
      disabled={rows.length === 0}
      className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm disabled:opacity-60"
    >
      Export
    </button>
  );
}
