import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import Work from "@/components/home/Work";
import Pricing from "@/components/home/Pricing";
import Faq from "@/components/home/Faq";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Work />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
