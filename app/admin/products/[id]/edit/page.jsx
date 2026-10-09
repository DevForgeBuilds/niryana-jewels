"use client";

import { useParams } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const product = useAdminStore((s) => s.products.find((p) => String(p.id) === String(id)));

  if (!product) {
    return <p className="text-charcoal/60">Product not found.</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">Edit Product</h1>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          category: product.category,
          price: product.price,
          metal: product.metal,
          stone: product.stone,
          certification: product.certification,
          description: product.description,
          stock_quantity: product.stock_quantity ?? 10,
          images: product.images?.length ? product.images : [""],
          video: product.video || "",
          variants: product.variants?.length ? product.variants : [],
        }}
      />
    </div>
  );
}
