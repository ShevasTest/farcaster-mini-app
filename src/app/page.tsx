"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Ждем загрузки SDK
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
          // @ts-expect-error SDK from external script may not be typed
          if (typeof window !== "undefined" && window.sdk?.actions?.ready) {
            // @ts-expect-error SDK from external script may not be typed
            await window.sdk.actions.ready();
            console.log("SDK ready called successfully");
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.log("SDK not found, app will work in browser mode");
        }
      } catch (error) {
        console.error("Error initializing SDK:", error);
      }
    };

    initApp();
  }, []);

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
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
              Check browser console for SDK status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
