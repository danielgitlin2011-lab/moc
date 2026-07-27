"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { PublicWebsite } from "@/components/public-website";
import { cn } from "@/lib/utils";

export default function PreviewPage() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  return (
    <div className="preview-page">
      <header className="preview-toolbar"><Link href="/dashboard/website"><ArrowLeft size={18} /> Back to editor</Link><div><button className={cn(device === "desktop" && "active")} onClick={() => setDevice("desktop")} aria-label="Desktop preview"><Monitor size={18} /></button><button className={cn(device === "mobile" && "active")} onClick={() => setDevice("mobile")} aria-label="Mobile preview"><Smartphone size={18} /></button></div><Link href="/site/olive-and-ember">Open live site <ExternalLink size={16} /></Link></header>
      <div className={cn("preview-canvas", `preview-${device}`)}><div className="preview-frame"><PublicWebsite preview /></div></div>
    </div>
  );
}
