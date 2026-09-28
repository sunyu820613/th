import { products } from "@/lib/mockData/products";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}
