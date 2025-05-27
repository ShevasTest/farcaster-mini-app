"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Ждем загрузки SDK с правильной проверкой
        let retries = 0;
        const maxRetries = 100;

        const waitForSDK = async (): Promise<boolean> => {
          return new Promise((resolve) => {
            const check = () => {
              // @ts-expect-error SDK from external CDN
              if (typeof window !== "undefined" && window.sdk?.actions?.ready) {
                resolve(true);
                return;
              }

              retries++;
              if (retries >= maxRetries) {
                console.warn("SDK not loaded after maximum retries");
                resolve(false);
                return;
              }

              setTimeout(check, 50);
            };
            check();
          });
        };

        const sdkLoaded = await waitForSDK();

        if (sdkLoaded) {
          // @ts-expect-error SDK from external CDN
          await window.sdk.actions.ready();
          console.log("✅ Farcaster SDK ready() called successfully");
        } else {
          console.log("⚠️ SDK not found - running in browser mode");
        }
      } catch (error) {
        console.error("❌ Error initializing Farcaster SDK:", error);
      }
    };

    initializeApp();
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
              Open browser console to see SDK status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
