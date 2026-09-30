import Hero from "@/components/Hero";
import FeaturedCollections from "@/components/FeaturedCollections";
import BrandStory from "@/components/BrandStory";
import InstagramFeed from "@/components/InstagramFeed";
import Newsletter from "@/components/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <BrandStory />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}
