"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Простая загрузка SDK
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && (window as any).sdk) {
        (window as any).sdk.actions?.ready?.();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Показываем контент сразу, без ожидания
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3e8ff",
        padding: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "448px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "24px",
            color: "#6b21a8",
          }}
        >
          🚀 My First Mini App
        </h1>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#4b5563", marginBottom: "16px" }}>
            Welcome to your first Farcaster Mini App!
          </p>
          <div
            style={{
              backgroundColor: "#faf5ff",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <p style={{ fontSize: "14px", color: "#7c2d92" }}>
              ✅ Mini App is working with purple background!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
