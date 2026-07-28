"use client";

import { useCallback, useEffect, useRef } from "react";
import { useApp } from "./app-provider";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/lib/types";

/**
 * Moves a lead to another stage, optimistically and then in Supabase.
 *
 * A failed write rolls the board back to the stage it came from rather than
 * leaving the UI claiming a change the database never accepted. Undo goes back
 * through the same path, so it persists too.
 */
export function useUpdateLeadStatus() {
  const { setState, businessId, notify } = useApp();

  // Undo re-enters this same function, so it reaches it through a ref rather
  // than closing over a value that does not exist yet.
  const latest = useRef<(leadId: string, name: string, from: LeadStatus, to: LeadStatus, announce: boolean) => void>(undefined);

  const move = useCallback((leadId: string, name: string, from: LeadStatus, to: LeadStatus, announce: boolean) => {
    const setStatus = (next: LeadStatus) =>
      setState(current => ({ ...current, leads: current.leads.map(entry => (entry.id === leadId ? { ...entry, status: next } : entry)) }));

    setStatus(to);
    if (announce) {
      notify(`${name} moved to ${to}`, {
        action: { label: "Undo", onClick: () => latest.current?.(leadId, name, to, from, false) },
      });
    }

    void (async () => {
      try {
        const { error } = await createClient().from("leads").update({ status: to }).eq("business_id", businessId).eq("id", leadId);
        if (error) throw error;
      } catch (err) {
        setStatus(from);
        notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save that change", { tone: "error" });
      }
    })();
  }, [businessId, notify, setState]);

  useEffect(() => {
    latest.current = move;
  }, [move]);

  return useCallback((lead: Lead, status: LeadStatus, options: { announce?: boolean } = {}) => {
    if (lead.status === status) return;
    move(lead.id, lead.customerName, lead.status, status, options.announce ?? false);
  }, [move]);
}
