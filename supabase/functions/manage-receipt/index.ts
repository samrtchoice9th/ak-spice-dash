import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface ReceiptItem {
  itemName: string;
  qty: number;
  price: number;
  total: number;
  reason?: string;
}

interface RequestBody {
  action: "create" | "update" | "delete";
  receipt_id?: string;
  type?: "purchase" | "sales" | "adjustment" | "increase" | "reduce";
  items?: ReceiptItem[];
  totalAmount?: number;
  customer_id?: string | null;
  supplier_id?: string | null;
  paid_amount?: number;
  due_amount?: number;
  due_date?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    // Get user's shop_id
    const { data: membership } = await supabaseAdmin
      .from("shop_members")
      .select("shop_id")
      .eq("user_id", userId)
      .limit(1)
      .single();
    const shopId = membership?.shop_id || null;

    const body: RequestBody = await req.json();
    const { action } = body;

    if (action === "create") {
      return await handleCreate(supabaseAdmin, body, userId, shopId);
    } else if (action === "update") {
      return await handleUpdate(supabaseAdmin, body, shopId);
    } else if (action === "delete") {
      return await handleDelete(supabaseAdmin, body);
    } else {
      return jsonResponse({ error: "Invalid action" }, 400);
    }
  } catch (err) {
    console.error("manage-receipt error:", err);
    return jsonResponse({ error: err.message || "Internal error" }, 500);
  }
});

// ─── HELPERS ────────────────────────────────────────────────────────

async function getOrCreateProduct(
  db: any,
  itemName: string,
  shopId: string | null,
  userId: string
) {
  if (!shopId) throw new Error("shop_id is required for all operations");

  const { data: product } = await db
    .from("products")
    .select("id, current_stock, avg_cost, price")
    .eq("name", itemName)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (product) return product;

  const { data: newProduct, error } = await db
    .from("products")
    .insert({
      name: itemName,
      current_stock: 0,
      avg_cost: 0,
      price: 0,
      user_id: userId,
      shop_id: shopId,
    })
    .select("id, current_stock, avg_cost, price")
    .single();

  if (error) throw new Error(`Failed to create product ${itemName}: ${error.message}`);
  return newProduct;
}

function isPurchaseType(type: string) {
  return type === "purchase" || type === "increase";
}

function isSalesType(type: string) {
  return type === "sales" || type === "reduce";
}

async function applyStockEffect(
  db: any,
  type: string,
  item: ReceiptItem,
  shopId: string | null,
  userId: string
) {
  const product = await getOrCreateProduct(db, item.itemName, shopId, userId);
  let newStock = product.current_stock;
  let newAvgCost = product.avg_cost;

  if (isPurchaseType(type)) {
    // Weighted average cost
    const oldValue = product.current_stock * product.avg_cost;
    const newValue = item.qty * item.price;
    const totalQty = product.current_stock + item.qty;
    newAvgCost = totalQty > 0 ? (oldValue + newValue) / totalQty : item.price;
    newStock += item.qty;
  } else if (isSalesType(type)) {
    newStock -= item.qty;
    if (newStock < 0) {
      throw new Error(`Insufficient stock for ${item.itemName}. Available: ${product.current_stock}, Requested: ${item.qty}`);
    }
    // avg_cost unchanged for sales
  }

  const { error } = await db
    .from("products")
    .update({
      current_stock: newStock,
      avg_cost: newAvgCost,
      updated_at: new Date().toISOString(),
    })
    .eq("id", product.id);

  if (error) throw new Error(`Failed to update stock for ${item.itemName}: ${error.message}`);
}

async function reverseStockEffect(db: any, type: string, item: ReceiptItem, shopId: string) {
  if (!shopId) throw new Error("shop_id is required for stock reversal");

  const { data: product } = await db
    .from("products")
    .select("id, current_stock, avg_cost")
    .eq("name", item.itemName)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (!product) return; // product was deleted, nothing to reverse

  let newStock = product.current_stock;
  let newAvgCost = product.avg_cost;

  if (isPurchaseType(type)) {
    // Reverse: remove the purchased qty and recalculate avg_cost
    newStock -= item.qty;
    if (newStock > 0) {
      const oldValue = product.current_stock * product.avg_cost;
      const removedValue = item.qty * item.price;
      newAvgCost = (oldValue - removedValue) / newStock;
      if (newAvgCost < 0) newAvgCost = 0;
    } else {
      newStock = 0;
      newAvgCost = 0;
    }
  } else if (isSalesType(type)) {
    // Reverse sale: add stock back
    newStock += item.qty;
    // avg_cost unchanged
  }

  const { error } = await db
    .from("products")
    .update({
      current_stock: newStock,
      avg_cost: newAvgCost,
      updated_at: new Date().toISOString(),
    })
    .eq("id", product.id);

  if (error) throw new Error(`Failed to reverse stock for ${item.itemName}: ${error.message}`);
}

// ─── ACTIONS ────────────────────────────────────────────────────────

async function handleCreate(
  db: any,
  body: RequestBody,
  userId: string,
  shopId: string | null
) {
  const { type, items, totalAmount, customer_id, supplier_id, paid_amount, due_amount, due_date } = body;

  if (!shopId) return jsonResponse({ error: "shop_id is required" }, 400);
  if (!type || !items || items.length === 0) {
    return jsonResponse({ error: "type and items are required" }, 400);
  }

  // Validate items
  for (const item of items) {
    if (!item.itemName?.trim()) return jsonResponse({ error: "Item name is required" }, 400);
    if (item.qty <= 0) return jsonResponse({ error: `Qty must be > 0 for ${item.itemName}` }, 400);
    if (item.price <= 0) return jsonResponse({ error: `Price must be > 0 for ${item.itemName}` }, 400);
  }

  const now = new Date();
  const date = now.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Colombo", hour12: true });

  // 1. Insert receipt
  const { data: receipt, error: receiptError } = await db
    .from("receipts")
    .insert({
      type,
      total_amount: totalAmount,
      date,
      time,
      user_id: userId,
      shop_id: shopId,
      customer_id: customer_id || null,
      supplier_id: supplier_id || null,
      paid_amount: paid_amount || 0,
      due_amount: due_amount || 0,
      due_date: due_date || null,
    })
    .select()
    .single();

  if (receiptError) throw new Error(`Failed to create receipt: ${receiptError.message}`);

  // 2. Insert receipt items
  const itemsToInsert = items.map((item) => ({
    receipt_id: receipt.id,
    item_name: item.itemName,
    qty: item.qty,
    price: item.price,
    total: item.total,
    reason: item.reason || null,
  }));

  const { data: insertedItems, error: itemsError } = await db
    .from("receipt_items")
    .insert(itemsToInsert)
    .select();

  if (itemsError) {
    // Rollback receipt
    await db.from("receipts").delete().eq("id", receipt.id);
    throw new Error(`Failed to create receipt items: ${itemsError.message}`);
  }

  // 3. Apply stock effects
  for (const item of items) {
    await applyStockEffect(db, type!, item, shopId, userId);
  }

  // Build response
  const result = {
    id: receipt.id,
    type: receipt.type,
    totalAmount: Number(receipt.total_amount),
    date: receipt.date,
    time: receipt.time,
    customer_id: receipt.customer_id,
    supplier_id: receipt.supplier_id,
    paid_amount: Number(receipt.paid_amount || 0),
    due_amount: Number(receipt.due_amount || 0),
    due_date: receipt.due_date,
    items: items.map((item, index) => ({
      id: insertedItems[index].id,
      itemName: item.itemName,
      qty: item.qty,
      price: item.price,
      total: item.total,
      reason: item.reason,
    })),
  };

  return jsonResponse(result);
}

async function handleUpdate(db: any, body: RequestBody, shopId: string | null) {
  const { receipt_id, type, items, totalAmount } = body;

  if (!receipt_id) return jsonResponse({ error: "receipt_id is required" }, 400);
  if (!type || !items || items.length === 0) {
    return jsonResponse({ error: "type and items are required" }, 400);
  }

  // 1. Fetch old receipt + items
  const { data: oldReceipt, error: fetchError } = await db
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("id", receipt_id)
    .single();

  if (fetchError || !oldReceipt) {
    return jsonResponse({ error: "Receipt not found" }, 404);
  }

  const oldItems: ReceiptItem[] = oldReceipt.receipt_items.map((ri: any) => ({
    itemName: ri.item_name,
    qty: Number(ri.qty),
    price: Number(ri.price),
    total: Number(ri.total),
  }));

  // 2. Reverse old stock effects
  for (const item of oldItems) {
    await reverseStockEffect(db, oldReceipt.type, item, shopId);
  }

  // 3. Update receipt
  const { error: updateError } = await db
    .from("receipts")
    .update({
      type,
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", receipt_id);

  if (updateError) throw new Error(`Failed to update receipt: ${updateError.message}`);

  // 4. Delete old items, insert new
  await db.from("receipt_items").delete().eq("receipt_id", receipt_id);

  const itemsToInsert = items.map((item) => ({
    receipt_id,
    item_name: item.itemName,
    qty: item.qty,
    price: item.price,
    total: item.total,
    reason: item.reason || null,
  }));

  const { error: newItemsError } = await db
    .from("receipt_items")
    .insert(itemsToInsert);

  if (newItemsError) throw new Error(`Failed to insert new items: ${newItemsError.message}`);

  // 5. Apply new stock effects
  // Get userId from old receipt for product creation
  const userId = oldReceipt.user_id;
  for (const item of items) {
    await applyStockEffect(db, type!, item, shopId, userId);
  }

  return jsonResponse({ success: true });
}

async function handleDelete(db: any, body: RequestBody) {
  const { receipt_id } = body;
  if (!receipt_id) return jsonResponse({ error: "receipt_id is required" }, 400);

  // 1. Fetch receipt + items
  const { data: receipt, error: fetchError } = await db
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("id", receipt_id)
    .single();

  if (fetchError || !receipt) {
    return jsonResponse({ error: "Receipt not found" }, 404);
  }

  const shopId = receipt.shop_id;
  if (!shopId) return jsonResponse({ error: "Receipt has no shop_id" }, 400);

  const oldItems: ReceiptItem[] = receipt.receipt_items.map((ri: any) => ({
    itemName: ri.item_name,
    qty: Number(ri.qty),
    price: Number(ri.price),
    total: Number(ri.total),
  }));

  // 2. Reverse stock effects
  for (const item of oldItems) {
    await reverseStockEffect(db, receipt.type, item, shopId);
  }

  // 3. Delete receipt items then receipt
  await db.from("receipt_items").delete().eq("receipt_id", receipt_id);
  const { error: deleteError } = await db
    .from("receipts")
    .delete()
    .eq("id", receipt_id);

  if (deleteError) throw new Error(`Failed to delete receipt: ${deleteError.message}`);

  return jsonResponse({ success: true });
}
