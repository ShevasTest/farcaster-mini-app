"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sdkStatus, setSdkStatus] = useState("loading");

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Показываем контент через секунду в любом случае
        setTimeout(() => {
          setSdkStatus("ready");
        }, 1000);

        // Параллельно пытаемся инициализировать SDK
        let retries = 0;
        const maxRetries = 50;

        const tryInitSDK = () => {
          // @ts-expect-error SDK from external CDN
          if (typeof window !== "undefined" && window.sdk?.actions?.ready) {
            // @ts-expect-error SDK from external CDN
            window.sdk.actions.ready();
            console.log("✅ Farcaster SDK ready() called");
            setSdkStatus("sdk-ready");
            return true;
          }

          retries++;
          if (retries < maxRetries) {
            setTimeout(tryInitSDK, 100);
          } else {
            console.log("⚠️ SDK not found - browser mode");
            setSdkStatus("browser-mode");
          }
          return false;
        };

        tryInitSDK();
      } catch (error) {
        console.error("❌ Error:", error);
        setSdkStatus("error");
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "448px",
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
              marginBottom: "12px",
            }}
          >
            <p style={{ fontSize: "14px", color: "#7c2d92" }}>
              ✅ Mini App is working with purple background!
            </p>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              padding: "8px",
              backgroundColor: "#f9fafb",
              borderRadius: "4px",
            }}
          >
            Status: {sdkStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
