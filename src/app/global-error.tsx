"use client";

import { useEffect } from "react";

/**
 * Global error boundary — the last line of defense. Replaces the root layout
 * when an error is thrown in the layout itself, so it must render its own
 * <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#111827",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            เกิดข้อผิดพลาด
          </h1>
          <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 24 }}>
            ขออภัยในความไม่สะดวก ระบบเกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#F97316",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
