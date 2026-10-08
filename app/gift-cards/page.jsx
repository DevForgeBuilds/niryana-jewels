import GiftCardsClient from "./GiftCardsClient";

export const metadata = {
  title: "Gift Cards | Niryana Jewels",
  description:
    "Give the gift of fine jewellery. Niryana Jewels digital gift cards are delivered instantly and can be redeemed on any purchase.",
  alternates: { canonical: "https://niryana-jewels-iota.vercel.app/gift-cards" },
};

export default function GiftCardsPage() {
  return <GiftCardsClient />;
}
