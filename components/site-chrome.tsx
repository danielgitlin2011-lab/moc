"use client";

import { ArrowUp, CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked chrome for a published catering site.
 *
 * Three jobs, all of them about the visitor rather than the page: show how far
 * through the story they are, keep the way back to the top within reach, and
 * on a phone keep calling and enquiring one thumb away at all times.
 */
export function SiteChrome({ phone, whatsapp, quoteLabel }: { phone: string; whatsapp: string; quoteLabel: string }) {
  const [progress, setProgress] = useState(0);
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
      // The header condenses once the hero is behind you, which is also the
      // point at which "back to top" stops being a redundant offer.
      setPast(window.scrollY > Math.min(window.innerHeight * 0.75, 620));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The class the stylesheet keys the condensed header off, kept on the root
  // element so it applies whether or not this component is in view.
  useEffect(() => {
    const site = document.querySelector(".public-site");
    site?.classList.toggle("is-scrolled", past);
    return () => site?.classList.remove("is-scrolled");
  }, [past]);

  return (
    <>
      <div className="site-scroll-progress" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></div>

      <button
        type="button"
        className={cn("back-to-top", past && "visible")}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        tabIndex={past ? 0 : -1}
      >
        <ArrowUp size={18} />
      </button>

      <div className="mobile-action-bar">
        {phone && <a href={`tel:${phone}`}><Phone size={17} /><span>Call</span></a>}
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>WhatsApp</span></a>
        )}
        <a className="mobile-action-primary" href="#quote"><CalendarCheck size={17} /><span>{quoteLabel}</span></a>
      </div>
    </>
  );
}
