import Image from "next/image";
import SizeGrid from "@/components/SizeGrid";
import { formatPrice, product } from "@/lib/product";

// Swap in the real product photo here (put the file in /public).
const PHOTO_SRC = "/pegasus-43-placeholder.svg";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[430px] overflow-x-hidden pb-12">
      {/* 1. Photo: fixed 240 px box, so nothing below moves when it loads */}
      <div className="relative h-[240px] w-full bg-neutral-100">
        <Image
          src={PHOTO_SRC}
          alt={`${product.name} in ${product.colorway}`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {/* 2. Name, colorway and price: shown once, not on the buttons */}
      <header className="px-4 pt-4">
        <h1 className="text-[20px] font-medium leading-[28px]">{product.name}</h1>
        <p className="text-[14px] leading-[20px] text-neutral-500">{product.colorway}</p>
        <p className="mt-1 text-[18px] font-semibold leading-[24px]">
          {formatPrice(product.price)}
        </p>
      </header>

      {/* 3. All sizes as a grid of buttons */}
      <SizeGrid sizes={product.sizes} />

      {/* 4. Tech copy (placeholder text: the data file has none) */}
      <section aria-labelledby="tech-heading" className="px-4 pt-8">
        <h2 id="tech-heading" className="mb-3 text-[20px] font-medium leading-[28px]">
          Details
        </h2>
        <p className="text-[16px] leading-[24px] text-neutral-700">
          Placeholder: product description goes here. Describe the cushioning,
          the upper and the fit in a few short sentences. This block grows with
          the copy and sits below the sizes, so it never pushes them down.
        </p>
      </section>

      {/* 5. Reviews (placeholder: the data file has no reviews) */}
      <section aria-labelledby="reviews-heading" className="px-4 pt-8">
        <h2 id="reviews-heading" className="mb-2 text-[20px] font-medium leading-[28px]">
          Reviews
        </h2>
        <p className="mb-4 text-[14px] leading-[20px] text-neutral-500">
          Placeholder: rating and review cards go here.
        </p>
        <ul className="space-y-3">
          {[1, 2, 3].map((n) => (
            <li
              key={n}
              className="h-[120px] rounded-md border border-dashed border-neutral-300 p-3 text-[14px] text-neutral-400"
            >
              Review {n}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 h-12 w-full rounded-md border border-neutral-900 text-[16px] font-medium"
        >
          See all reviews
        </button>
      </section>
    </main>
  );
}
