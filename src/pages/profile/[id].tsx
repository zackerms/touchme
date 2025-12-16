"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import { storage } from "@/lib/storage";
import type { Profile } from "@/types/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (router.isReady && id && typeof id === "string") {
        try {
          const found = await storage.getProfile(id);
          if (found) {
            setProfile(found);
          } else {
            alert("プロフィールが見つかりません");
            router.push("/");
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
          alert("プロフィールの読み込みに失敗しました");
          router.push("/");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadProfile();
  }, [router.isReady, id, router]);

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    color: "var(--foreground)",
  };

  const profilePageStyle: React.CSSProperties = {
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  const backButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "20px",
    left: "20px",
    padding: "10px 20px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    color: "var(--foreground)",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>読み込み中... - touchme</title>
        </Head>
        <div style={loadingStyle}>読み込み中...</div>
      </>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{profile.name} - touchme</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={profilePageStyle}>
        <button
          style={backButtonStyle}
          onClick={() => router.push("/")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          ← 一覧に戻る
        </button>
        <ProfileCard profile={profile} />
      </main>
    </>
  );
}
