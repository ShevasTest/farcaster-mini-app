"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    sdk?: {
      actions: {
        ready: () => void;
      };
    };
  }
}

export default function Home() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initSdk = () => {
      if (typeof window !== "undefined" && window.sdk) {
        window.sdk.actions.ready();
        setIsReady(true);
      } else {
        // Fallback через 1 секунду
        setTimeout(() => {
          if (window.sdk) {
            window.sdk.actions.ready();
          }
          setIsReady(true);
        }, 1000);
      }
    };

    // Проверяем сразу и через интервал
    initSdk();
    const interval = setInterval(() => {
      if (window.sdk && !isReady) {
        window.sdk.actions.ready();
        setIsReady(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isReady]);

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
              Ready: {isReady ? "Yes" : "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
