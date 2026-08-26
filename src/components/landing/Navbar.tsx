import Image from "next/image";

/* Landing-only values (not in the design system, per agreed policy):
   #dedcdc nav/logo text, #2e2e2e "Log in" border, #0a0a0a text on white. */

const links = ["Features", "Pricing", "Testimonial", "Documents"];

export default function Navbar() {
  return (
    <div className="px-10 pt-4">
      <header className="mx-auto flex h-8 w-full max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="pointer-events-auto flex items-center gap-[7px]">
            <Image
              src="/logo-mark.svg"
              alt="Cocoding logo"
              width={26}
              height={15}
            />
            <span className="text-[16px] font-semibold leading-none tracking-[-0.16px] text-[#dedcdc]">
              Cocoding
            </span>
          </a>
          <nav className="flex items-center gap-6">
            {links.map((label) => (
              <a
                key={label}
                href="#"
                className="pointer-events-auto text-body-sm text-[#dedcdc]"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm border-[0.9px] border-[#2e2e2e] px-3 text-body-sm whitespace-nowrap text-[#dedcdc]"
          >
            Log in
          </a>
          <a
            href="#"
            className="pointer-events-auto flex h-8 items-center justify-center rounded-sm bg-button-primary px-3 text-body-sm whitespace-nowrap text-[#0a0a0a]"
          >
            Sign up
          </a>
        </div>
      </header>
    </div>
  );
}
