"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Hairline, Tick } from "./Hairline";

/* A listbox menu for the hero's prompt box (2026-10-23): the trigger is
   the design's own label + chevron, the menu Pricing's credits picker
   (Credits in Pricing.tsx) opening DOWNWARD under the trigger, aligned to
   its left or right edge. (A translucent glass surface was tried and
   set aside 2026-10-23; the menu stays solid for now.) Click or arrow
   keys to open; arrows, Home / End move, Enter / Space choose, Escape /
   Tab / a click outside close. */
export default function Menu({
  label,
  options,
  value,
  onChange,
  align = "left",
  buttonClassName,
  labelClassName,
}: {
  label: string; // the listbox's accessible name
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  align?: "left" | "right";
  buttonClassName: string;
  labelClassName: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = Math.max(0, options.indexOf(value));

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const openAt = (i: number) => {
    setActive(i);
    setOpen(true);
  };
  const choose = (i: number) => {
    onChange(options[i]);
    setOpen(false);
    buttonRef.current?.focus();
  };
  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "Tab") setOpen(false);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => (open ? setOpen(false) : openAt(selected))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openAt(selected);
          }
        }}
        className={buttonClassName}
      >
        <span className={labelClassName}>{value}</span>
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={16}
          height={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className={`absolute top-full z-20 mt-2 min-w-40 ${align === "right" ? "right-0" : "left-0"}`}>
          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${id}-${active}`}
            onKeyDown={onListKey}
            className="rounded-md bg-[#111216] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)] outline-none"
          >
            {options.map((option, i) => (
              <li
                key={option}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex h-9 cursor-pointer items-center justify-between gap-3 whitespace-nowrap rounded-sm px-2.5 text-body-sm ${
                  i === active ? "bg-white/[0.06]" : ""
                } ${i === selected ? "text-text-primary" : "text-text-body"}`}
              >
                {option}
                {i === selected && <Tick />}
              </li>
            ))}
          </ul>
          <Hairline radius={8} />
        </div>
      )}
    </div>
  );
}
