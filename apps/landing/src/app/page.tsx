import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Proof from "@/components/Proof";
import SelfHosted from "@/components/SelfHosted";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Proof />
      <SelfHosted />
      <Footer />
    </main>
  );
}
