import Image from "next/image";

/* Landing-only values: #dedcdc badge text, #3f3f3f/32 badge border,
   #131516 text on accent, #121212 prompt surface, #929292/50 placeholder,
   12px badge label size. Opacity variants of system colors use token/NN. */

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M3.5 8H12.5M8.5 4L12.5 8L8.5 12"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AnnouncementBadge() {
  return (
    <div className="flex h-8 items-center justify-center gap-2 rounded-full border-[0.7px] border-[#3f3f3f]/32 py-1.5 pl-1.5 pr-2.5">
      <span className="flex h-[22px] items-center justify-center rounded-full bg-accent px-2 text-[12px] leading-[14px] text-[#131516]">
        New
      </span>
      <p className="flex items-center gap-1.5 text-body-xs leading-none text-[#dedcdc]">
        Claude Opus 4.7 now available
        <ArrowRight className="text-text-body/60" />
      </p>
    </div>
  );
}

function PromptBox() {
  return (
    <div
      className="pointer-events-auto relative h-[150px] w-full overflow-hidden rounded-2xl border-[0.7px] border-transparent"
      style={{
        /* Figma: background is rgba(0,0,0,.2) over #171717; the stroke is a
           vertical gradient (measured #232323 → #1c1c1c against the page),
           which Figma's CSS export flattened to `solid #FFF`.
           padding-box/border-box layering paints both while keeping the radius. */
        background: [
          "linear-gradient(0deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.20) 100%) padding-box",
          "linear-gradient(0deg, #171717 0%, #171717 100%) padding-box",
          "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%) border-box",
        ].join(", "),
      }}
    >
      <textarea
        placeholder="I want to create a furniture marketing website..."
        className="pointer-events-auto h-full w-full resize-none bg-transparent px-5 pb-14 pt-[21px] text-body-sm text-text-primary outline-none placeholder:text-[#929292]/50"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Attach a file"
            className="pointer-events-auto relative size-4 overflow-hidden"
          >
            <Image
              src="/icons/paperclip.svg"
              alt=""
              fill
              className="scale-150"
            />
          </button>
          <button
            type="button"
            className="pointer-events-auto flex h-8 items-center gap-1 rounded-md py-1.5 pl-3 pr-2"
          >
            <span className="text-body-sm text-text-body">Auto</span>
            <Image
              src="/icons/chevron-down.svg"
              alt=""
              width={16}
              height={16}
            />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button type="button" className="pointer-events-auto flex items-center gap-[3px]">
            <span className="text-body-xs text-text-body">Gemini 3.0</span>
            <Image
              src="/icons/chevron-down.svg"
              alt=""
              width={16}
              height={16}
            />
          </button>
          <button
            type="button"
            aria-label="Voice input"
            className="pointer-events-auto flex size-8 items-center justify-center rounded-md bg-button-primary/61"
          >
            <Image
              src="/icons/audio-lines.svg"
              alt=""
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="flex justify-center px-10 pt-[15vh]">
      <div className="flex w-full max-w-[660px] flex-col items-center gap-9">
        <div className="flex flex-col items-center gap-6">
          <AnnouncementBadge />
          <h1 className="whitespace-nowrap text-display text-text-primary">
            What do you want to build?
          </h1>
          <p className="text-center text-body-md text-text-body/60">
            Create secure apps and websites that work from day one.
          </p>
        </div>
        <PromptBox />
      </div>
    </section>
  );
}
