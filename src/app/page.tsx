import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Unicorn Studio background — self-adaptive, sits behind everything and
          stays mouse-interactive. The content layer above is pointer-events-none
          so the cursor reaches this scene; individual controls opt back in with
          pointer-events-auto. */}
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
  );
}
