"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = ["new", "contacted", "quoted", "closed"];

interface Props {
  quoteId: string;
  currentStatus: string;
  statusColor: Record<string, string>;
}

export default function QuoteStatusSelect({ quoteId, currentStatus, statusColor }: Props) {
  const [status, setStatus] = useState(currentStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const supabase = createClient();
    await supabase.from("quote_requests").update({ status: newStatus }).eq("id", quoteId);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      className={`text-xs px-3 py-1.5 rounded-full border-0 cursor-pointer font-medium ${statusColor[status] ?? "bg-cream-100 text-charcoal-800/40"}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
