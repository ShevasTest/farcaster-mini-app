"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [sdkStatus, setSdkStatus] = useState("initializing");

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("🔄 Starting Mini App...");

        // Минимальное время загрузки для UX
        const minLoadTime = new Promise((resolve) => setTimeout(resolve, 2000));

        // Попытка инициализации SDK
        const sdkInit = (async () => {
          try {
            const { sdk } = await import("@farcaster/frame-sdk");
            await sdk.actions.ready();
            setSdkStatus("ready");
            console.log("✅ SDK initialized");
          } catch (error) {
            setSdkStatus("browser-mode");
            console.log("⚠️ Browser mode");
          }
        })();

        // Ждем и минимальное время, и SDK
        await Promise.all([minLoadTime, sdkInit]);

        // Скрываем лоадер
        setIsLoading(false);
        console.log("🎉 App ready!");
      } catch (error) {
        console.error("❌ Init error:", error);
        setSdkStatus("error");
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#f3e8ff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        {/* Spinning Loader */}
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid #e9d5ff",
            borderTop: "4px solid #8b5cf6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
          }}
        />

        <h2
          style={{
            color: "#6b21a8",
            fontSize: "20px",
            fontWeight: "bold",
            margin: "0 0 8px 0",
          }}
        >
          Loading Mini App...
        </h2>

        <p
          style={{
            color: "#8b5cf6",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Status: {sdkStatus}
        </p>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f3e8ff",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          animation: "fadeIn 0.5s ease-in",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#6b21a8",
            margin: "0 0 20px 0",
          }}
        >
          🚀 My First Mini App
        </h1>

        <p
          style={{
            color: "#4b5563",
            margin: "0 0 24px 0",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        >
          Welcome to your first Farcaster Mini App!
        </p>

        <div
          style={{
            backgroundColor: "#faf5ff",
            padding: "20px",
            borderRadius: "12px",
            margin: "0 0 16px 0",
            border: "2px solid #e9d5ff",
          }}
        >
          <p
            style={{
              color: "#7c2d92",
              margin: 0,
              fontWeight: "600",
              fontSize: "16px",
            }}
          >
            ✅ Mini App loaded successfully!
          </p>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            padding: "10px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          SDK Status: {sdkStatus}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
