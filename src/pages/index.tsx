"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { storage } from "@/lib/storage";
import type { Profile } from "@/types/profile";

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setProfiles(storage.getProfiles());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("このプロフィールを削除しますか？")) {
      storage.deleteProfile(id);
      setProfiles(storage.getProfiles());
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const indexPageStyle: React.CSSProperties = {
    minHeight: "100vh",
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  };

  const headerH1Style: React.CSSProperties = {
    fontSize: "32px",
    color: "var(--foreground)",
  };

  const getCreateButtonStyle = (): React.CSSProperties => {
    const isHovered = hoveredButton === "create";
    return {
      padding: "12px 24px",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      boxShadow: isHovered
        ? "0 4px 12px rgba(99, 102, 241, 0.4)"
        : "none",
    };
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--foreground)",
    opacity: 0.7,
  };

  const emptyStatePStyle: React.CSSProperties = {
    fontSize: "18px",
    marginBottom: "20px",
  };

  const profileListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const getProfileItemStyle = (id: string): React.CSSProperties => {
    const isHovered = hoveredItem === id;
    return {
      background: isHovered
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${
        isHovered ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"
      }`,
      borderRadius: "12px",
      padding: "16px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transform: isHovered ? "translateX(4px)" : "translateX(0)",
    };
  };

  const profilePreviewStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  };

  const previewImageStyle: React.CSSProperties = {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  };

  const previewInfoH3Style: React.CSSProperties = {
    fontSize: "18px",
    color: "var(--foreground)",
    marginBottom: "4px",
  };

  const previewLinksStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    fontSize: "14px",
    opacity: 0.7,
  };

  const profileActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
  };

  const getEditButtonStyle = (profileId: string): React.CSSProperties => {
    const isHovered = hoveredButton === `edit-${profileId}`;
    return {
      padding: "8px 16px",
      border: `1px solid rgba(59, 130, 246, 0.3)`,
      borderRadius: "6px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: isHovered
        ? "rgba(59, 130, 246, 0.3)"
        : "rgba(59, 130, 246, 0.2)",
      color: "#3b82f6",
    };
  };

  const getDeleteButtonStyle = (profileId: string): React.CSSProperties => {
    const isHovered = hoveredButton === `delete-${profileId}`;
    return {
      padding: "8px 16px",
      border: `1px solid rgba(239, 68, 68, 0.3)`,
      borderRadius: "6px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: isHovered
        ? "rgba(239, 68, 68, 0.3)"
        : "rgba(239, 68, 68, 0.2)",
      color: "#ef4444",
    };
  };

  return (
    <>
      <Head>
        <title>touchme - プロフィール一覧</title>
        <meta name="description" content="touchme - エンジニア向けプロフィールカードアプリ" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main style={indexPageStyle}>
        <div style={headerStyle}>
          <h1 style={headerH1Style}>touchme</h1>
          <button
            style={getCreateButtonStyle()}
            onClick={() => router.push("/edit")}
            onMouseEnter={() => setHoveredButton("create")}
            onMouseLeave={() => setHoveredButton(null)}
          >
            + 新規作成
          </button>
        </div>
        {profiles.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={emptyStatePStyle}>プロフィールがありません</p>
            <button
              style={getCreateButtonStyle()}
              onClick={() => router.push("/edit")}
              onMouseEnter={() => setHoveredButton("create")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              最初のプロフィールを作成
            </button>
          </div>
        ) : (
          <div style={profileListStyle}>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                style={getProfileItemStyle(profile.id)}
                onClick={() => handleCardClick(profile.id)}
                onMouseEnter={() => setHoveredItem(profile.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div style={profilePreviewStyle}>
                  <img
                    src={profile.imageUrl || "/api/placeholder/100/100"}
                    alt={profile.name}
                    style={previewImageStyle}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23999' width='100' height='100'/%3E%3Ctext fill='%23fff' font-family='sans-serif' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div>
                    <h3 style={previewInfoH3Style}>{profile.name}</h3>
                    <div style={previewLinksStyle}>
                      {profile.links.twitter && <span>𝕏</span>}
                      {profile.links.github && <span>⚡</span>}
                      {profile.links.zenn && <span>Z</span>}
                    </div>
                  </div>
                </div>
                <div style={profileActionsStyle}>
                  <button
                    style={getEditButtonStyle(profile.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/edit?id=${profile.id}`);
                    }}
                    onMouseEnter={() => setHoveredButton(`edit-${profile.id}`)}
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    編集
                  </button>
                  <button
                    style={getDeleteButtonStyle(profile.id)}
                    onClick={(e) => handleDelete(profile.id, e)}
                    onMouseEnter={() =>
                      setHoveredButton(`delete-${profile.id}`)
                    }
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
