import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { WhyUs } from "@/components/WhyUs";
import { SellCta } from "@/components/SellCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyUs />
      <SellCta />
    </>
  );
}
