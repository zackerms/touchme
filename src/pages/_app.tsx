"use client";

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Service Workerの登録
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  useEffect(() => {
    // PWAインストールプロンプトの自動表示
    if (typeof window === "undefined") return;

    // 既にインストール済みかチェック（standaloneモード）
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      // 既にインストール済みの場合は何もしない
      return;
    }

    // beforeinstallpromptイベントのキャッチ
    const handleBeforeInstallPrompt = (e: Event) => {
      // デフォルトのプロンプトを防ぐ
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // ページロード後、1.5秒後に自動的にプロンプトを表示
      setTimeout(() => {
        if (promptEvent && !isStandalone) {
          promptEvent
            .prompt()
            .then(() => {
              return promptEvent.userChoice;
            })
            .then((choiceResult) => {
              if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
              } else {
                console.log("User dismissed the install prompt");
              }
              setDeferredPrompt(null);
            })
            .catch((error) => {
              console.error("Error showing install prompt:", error);
              setDeferredPrompt(null);
            });
        }
      }, 1500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  return <Component {...pageProps} />;
}
