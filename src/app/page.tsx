"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";

export default function Home() {
  const [sdkStatus, setSdkStatus] = useState("initializing");

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🔄 Initializing Farcaster SDK...");

        // Правильный вызов SDK
        await sdk.actions.ready();

        console.log("✅ Farcaster SDK ready() called successfully");
        setSdkStatus("ready");
      } catch (error) {
        console.error("❌ Error initializing Farcaster SDK:", error);
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
            SDK Status: {sdkStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
