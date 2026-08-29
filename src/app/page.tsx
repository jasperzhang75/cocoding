import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrendingProjects from "@/components/landing/TrendingProjects";
import LogoMarquee from "@/components/landing/LogoMarquee";
import Features from "@/components/landing/Features";

export default function Home() {
  return (
    <>
      {/* The Unicorn Studio scene backs the first screen only, so it is scoped
          to this wrapper rather than the whole (now much taller) page. It stays
          mouse-interactive: the content layer above is pointer-events-none and
          individual controls opt back in with pointer-events-auto. */}
      <div className="relative min-h-screen overflow-hidden">
        <iframe
          src="https://www.unicorn.studio/embed/hjz7dlZ2jZHar7bHXhfg"
          title="Background animation"
          aria-hidden
          className="absolute inset-0 size-full border-0"
        />

        <div className="pointer-events-none relative z-10">
          <Navbar />
          <Hero />
        </div>
      </div>

      <TrendingProjects />
      <LogoMarquee />
      <Features />
    </>
  );
}
