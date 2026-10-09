import Hero from "@/components/Hero";
import FestiveSaleBanner from "@/components/FestiveSaleBanner";
import FeaturedCollections from "@/components/FeaturedCollections";
import FestiveBanner from "@/components/FestiveBanner";
import BrandStory from "@/components/BrandStory";
import InstagramFeed from "@/components/InstagramFeed";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FestiveSaleBanner />
      <FeaturedCollections />
      <FestiveBanner />
      <BrandStory />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}
