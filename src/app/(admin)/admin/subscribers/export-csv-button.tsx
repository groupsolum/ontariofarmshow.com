"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EmailSubscriber } from "@/types/subscriber";

interface ExportCsvButtonProps {
  subscribers: EmailSubscriber[];
}

export function ExportCsvButton({ subscribers }: ExportCsvButtonProps) {
  function handleExport() {
    if (subscribers.length === 0) return;

    const headers = ["Email", "Name", "Status", "Source", "Subscribed At"];
    const rows = subscribers.map((s) => [
      s.email,
      s.name ?? "",
      s.status,
      s.source ?? "",
      s.created_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={subscribers.length === 0}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
