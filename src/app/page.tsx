import Navbar from "@/components/landing/Navbar";
import HeroBackground from "@/components/landing/HeroBackground";
import Hero from "@/components/landing/Hero";
import TrendingProjects from "@/components/landing/TrendingProjects";
import LogoMarquee from "@/components/landing/LogoMarquee";
import Features from "@/components/landing/Features";
import Infrastructure from "@/components/landing/Infrastructure";
import Pricing from "@/components/landing/Pricing";
import Testimonial from "@/components/landing/Testimonial";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      {/* The Unicorn Studio scene backs the first screen only, so it is scoped
          to this wrapper rather than the whole (now much taller) page. It stays
          mouse-interactive: the content layer above is pointer-events-none and
          individual controls opt back in with pointer-events-auto.
          The first screen is the SMALL viewport (svh): on a phone 100vh is
          the height with the browser's bars collapsed, so the bottom of the
          scene — its glow — sat under Safari's toolbar (Jasper, iPhone,
          2026-09-08). */}
      <div className="relative min-h-svh overflow-hidden">
        <HeroBackground />

        <div className="pointer-events-none relative z-10">
          <Navbar />
          <Hero />
        </div>
      </div>

      <TrendingProjects />
      <LogoMarquee />
      <Features />
      <Infrastructure />
      <Testimonial />
      <Pricing />
      <FinalCta />
      <Footer />
    </>
  );
}
