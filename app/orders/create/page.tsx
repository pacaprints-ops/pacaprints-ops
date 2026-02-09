
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import LineItemsSection from "./LineItemsSection";

type Option = { id: string; name: string };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toNum(s: string) {
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export default function CreateOrderPage() {
  const router = useRouter();

  const [platform, setPlatform] = useState<string>("tiktok"); // ✅ default TikTok
  const [platformCustom, setPlatformCustom] = useState<string>("");

  const [platformRef, setPlatformRef] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>(""); // ✅ new field
  const [orderDate, setOrderDate] = useState<string>(todayISO());
  const [revenue, setRevenue] = useState<string>("");
  const [shippingCost, setShippingCost] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [products, setProducts] = useState<Option[]>([]);
  const [recipes, setRecipes] = useState<Option[]>([]);
  const [lineItems, setLineItems] = useState<any[]>([]);

  const effectivePlatform = useMemo(() => {
    if (platform === "custom") return platformCustom.trim();
    return platform;
  }, [platform, platformCustom]);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      setErrorMsg("");

      try {
        const { data: productsData, error: pErr } = await supabase
          .from("products")
          .select("id,name")
          .order("name", { ascending: true });
        if (pErr) throw pErr;

        const { data: recipesData, error: rErr } = await supabase
          .from("recipes")
          .select("id,name")
          .order("name", { ascending: true });
        if (rErr) throw rErr;

        if (cancelled) return;
        setProducts((productsData ?? []) as Option[]);
        setRecipes((recipesData ?? []) as Option[]);
      } catch (e: any) {
        if (!cancelled) setErrorMsg(e?.message ?? "Failed to load products/recipes");
      }
    };

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setErrorMsg("");

    // Basic validation
    if (!orderDate) return setErrorMsg("Please select an order date.");
    if (!effectivePlatform) return setErrorMsg("Please select a platform (or enter custom).");

    const revenueNum = toNum(revenue);
    const shippingNum = shippingCost ? toNum(shippingCost) : 0;

    if (!Number.isFinite(revenueNum)) return setErrorMsg("Revenue must be a number.");
    if (!Number.isFinite(shippingNum)) return setErrorMsg("Shipping cost must be a number.");

    if (!lineItems || lineItems.length === 0) return setErrorMsg("Please add at least 1 line item.");

    // Validate line items before saving anything
    for (const line of lineItems) {
      if (!line?.recipe_id) return setErrorMsg("Each line needs a recipe selected.");
      if (!line?.product_name || !String(line.product_name).trim())
        return setErrorMsg("Each line needs a product name.");
      if (!line?.quantity || Number(line.quantity) < 1)
        return setErrorMsg("Each line needs a quantity of 1 or more.");
    }

    setSaving(true);

    try {
      // 1) Create order header
      const { data: orderId, error: headerErr } = await supabase.rpc("create_order", {
        p_order_date: orderDate,
        p_customer_name: customerName.trim() || null,
        p_platform: effectivePlatform,
        p_platform_order_ref: platformRef.trim() || null,
        p_revenue: revenueNum,
        p_shipping_cost: Number.isFinite(shippingNum) ? shippingNum : 0,
        p_discounts: 0,
      });

      if (headerErr) throw headerErr;

      // 2) Save ALL line items
      for (const line of lineItems) {
        const name = String(line.product_name).trim();

        // find product id (or create)
        const { data: productRow, error: findErr } = await supabase
          .from("products")
          .select("id")
          .eq("name", name)
          .maybeSingle();

        if (findErr) throw findErr;

        let productId = productRow?.id;

        if (!productId) {
          const { data: newProduct, error: newProductError } = await supabase
            .from("products")
            .insert({ name })
            .select("id")
            .single();

          if (newProductError) throw newProductError;
          productId = newProduct.id;
        }

        // Costing + FIFO via recipe
        const { error: lineErr } = await supabase.rpc("add_order_product", {
          p_order_id: orderId,
          p_recipe_id: line.recipe_id,
          p_quantity: Number(line.quantity),
          p_product_id: productId,
        });

        if (lineErr) throw lineErr;
      }

      router.push("/orders");
      router.refresh();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Failed to save order");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  return (
    <main className="p-4 sm:p-6 max-w-xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Add order</h1>
        <Link href="/orders" className="text-sm text-gray-600 underline">
          Cancel
        </Link>
      </div>

      {errorMsg ? (
        <div className="mb-4 rounded-lg border bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      <div className="space-y-4 pb-24">
        {/* Platform */}
        <div className="rounded-lg border bg-white p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-1">Platform</label>
          <select
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="tiktok">TikTok</option>
            <option value="shopify">Shopify</option>
            <option value="etsy">Etsy</option>
            <option value="ebay">eBay</option>
            <option value="custom">Custom</option>
          </select>

          {platform === "custom" ? (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Custom platform</label>
              <input
                type="text"
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                value={platformCustom}
                onChange={(e) => setPlatformCustom(e.target.value)}
                placeholder="e.g. Instagram"
              />
            </div>
          ) : null}
        </div>

        {/* Details */}
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Platform order reference
            </label>
            <input
              type="text"
              placeholder="Order ID / reference"
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              value={platformRef}
              onChange={(e) => setPlatformRef(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Customer name</label>
            <input
              type="text"
              placeholder="Optional"
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Order date</label>
              <input
                type="date"
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Revenue (net payout)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="£0.00"
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Shipping cost</label>
              <input
                type="number"
                step="0.01"
                placeholder="£0.00"
                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <LineItemsSection
          products={products}
          recipes={recipes}
          value={lineItems}
          onChange={setLineItems}
        />
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur">
        <div className="max-w-xl mx-auto p-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full rounded-lg px-4 py-3 text-sm font-semibold ${
              saving ? "bg-gray-300 text-gray-700" : "bg-gray-900 text-white"
            }`}
          >
            {saving ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>
    </main>
  );
}
