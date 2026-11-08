"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AdminReplyForm({
  ticketId,
  status,
  adminReply,
}: {
  ticketId: string;
  status: string;
  adminReply?: string | null;
}) {
  const [replyText, setReplyText] = useState(adminReply || "");
  const [isSaved, setIsSaved] = useState(Boolean(adminReply));
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, replyText }),
      });
      if (res.ok) {
        setIsSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      {isSaved ? (
        <div className="rounded bg-muted p-2 text-xs">
          <span className="font-semibold text-primary">Ответ отправлен: </span>
          {replyText}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded border bg-background px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="Написать ответ пользователю..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <Button size="sm" onClick={handleSend} disabled={loading}>
            {loading ? "Отправка..." : "Ответить"}
          </Button>
        </div>
      )}
    </div>
  );
}

