import raw from "@/data/nike_pegasus_size_stock.json";

// One row per size (SKU). Name, price and colorway repeat on every row,
// so they are read once from the first row and shown once on the page.
type Row = {
  product_name?: string;
  price: number;
  colorway: string;
  display_order: number;
  size_label: string;
  in_stock: boolean;
  low_stock?: boolean;
  // 8 December 2026 snapshot: "in_stock" | "low_stock" | "sold_out"
  stock_status?: string;
};

export type Size = {
  order: number;
  label: string;
  inStock: boolean;
  lowStock: boolean;
};

export type Product = {
  name: string;
  price: number;
  colorway: string;
  sizes: Size[];
};

// Accepts either a bare array of rows or an object with a `sizes` array,
// so the real file can be dropped in without code changes.
const rows: Row[] = Array.isArray(raw)
  ? (raw as Row[])
  : ((raw as { sizes: Row[] }).sizes ?? []);

const first = rows[0];

export const product: Product = {
  name: first?.product_name ?? "Nike Pegasus 43",
  price: first?.price ?? 140,
  colorway: first?.colorway ?? "Black/White-Volt",
  sizes: [...rows]
    .sort((a, b) => a.display_order - b.display_order)
    .map((r) => ({
      order: r.display_order,
      label: r.size_label,
      inStock: r.in_stock && r.stock_status !== "sold_out",
      lowStock:
        r.in_stock && (r.stock_status === "low_stock" || Boolean(r.low_stock)),
    })),
};

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}
