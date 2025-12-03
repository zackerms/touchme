"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { storage } from "@/lib/storage";
import type { Profile } from "@/types/profile";

export default function Edit() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<Profile>({
    id: "",
    name: "",
    imageUrl: "",
    links: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      if (id && typeof id === "string") {
        const existing = storage.getProfile(id);
        if (existing) {
          setProfile(existing);
        } else {
          alert("プロフィールが見つかりません");
          router.push("/");
        }
      } else {
        setProfile({
          id: storage.generateId(),
          name: "",
          imageUrl: "",
          links: {},
        });
      }
      setIsLoading(false);
    }
  }, [router.isReady, id, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert("名前を入力してください");
      return;
    }
    storage.saveProfile(profile);
    router.push(`/profile/${profile.id}`);
  };

  const handleChange = (
    field: keyof Profile | "links",
    value: string | Profile["links"]
  ) => {
    if (field === "links") {
      setProfile({ ...profile, links: value as Profile["links"] });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  const loadingStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    color: "var(--foreground)",
  };

  const editPageStyle: React.CSSProperties = {
    minHeight: "100vh",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const editContainerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "600px",
  };

  const editContainerH1Style: React.CSSProperties = {
    fontSize: "28px",
    color: "var(--foreground)",
    marginBottom: "30px",
  };

  const editFormStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "30px",
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "24px",
  };

  const formGroupLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: "bold",
    color: "var(--foreground)",
    marginBottom: "8px",
  };

  const getInputStyle = (inputId: string): React.CSSProperties => {
    const isFocused = focusedInput === inputId;
    return {
      width: "100%",
      padding: "12px",
      background: isFocused
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${
        isFocused ? "#6366f1" : "rgba(255, 255, 255, 0.2)"
      }`,
      borderRadius: "8px",
      color: "var(--foreground)",
      fontSize: "16px",
      boxSizing: "border-box",
      outline: "none",
    };
  };

  const imagePreviewStyle: React.CSSProperties = {
    marginTop: "12px",
  };

  const imagePreviewImgStyle: React.CSSProperties = {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "2px solid rgba(255, 255, 255, 0.2)",
  };

  const snsInputsStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const snsInputGroupLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: "normal",
    opacity: 0.8,
  };

  const formActionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "30px",
  };

  const getCancelButtonStyle = (): React.CSSProperties => {
    const isHovered = hoveredButton === "cancel";
    return {
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: isHovered
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(255, 255, 255, 0.1)",
      color: "var(--foreground)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    };
  };

  const getSubmitButtonStyle = (): React.CSSProperties => {
    const isHovered = hoveredButton === "submit";
    return {
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      color: "white",
      transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      boxShadow: isHovered
        ? "0 4px 12px rgba(99, 102, 241, 0.4)"
        : "none",
    };
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

  return (
    <>
      <Head>
        <title>
          {id ? "プロフィール編集" : "新規プロフィール作成"} - touchme
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={editPageStyle}>
        <div style={editContainerStyle}>
          <h1 style={editContainerH1Style}>
            {id ? "プロフィール編集" : "新規プロフィール作成"}
          </h1>
          <form onSubmit={handleSubmit} style={editFormStyle}>
            <div style={formGroupStyle}>
              <label htmlFor="name" style={formGroupLabelStyle}>
                名前 *
              </label>
              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
                placeholder="あなたの名前"
                required
                style={getInputStyle("name")}
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="imageUrl" style={formGroupLabelStyle}>
                プロフィール画像URL
              </label>
              <input
                id="imageUrl"
                type="url"
                value={profile.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                onFocus={() => setFocusedInput("imageUrl")}
                onBlur={() => setFocusedInput(null)}
                placeholder="https://example.com/image.jpg"
                style={getInputStyle("imageUrl")}
              />
              {profile.imageUrl && (
                <div style={imagePreviewStyle}>
                  <img
                    src={profile.imageUrl}
                    alt="プレビュー"
                    style={imagePreviewImgStyle}
                  />
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={formGroupLabelStyle}>SNSリンク</label>
              <div style={snsInputsStyle}>
                <div>
                  <label
                    htmlFor="twitter"
                    style={snsInputGroupLabelStyle}
                  >
                    X (Twitter)
                  </label>
                  <input
                    id="twitter"
                    type="url"
                    value={profile.links.twitter || ""}
                    onChange={(e) =>
                      handleChange("links", {
                        ...profile.links,
                        twitter: e.target.value || undefined,
                      })
                    }
                    onFocus={() => setFocusedInput("twitter")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="https://x.com/username"
                    style={getInputStyle("twitter")}
                  />
                </div>
                <div>
                  <label htmlFor="github" style={snsInputGroupLabelStyle}>
                    GitHub
                  </label>
                  <input
                    id="github"
                    type="url"
                    value={profile.links.github || ""}
                    onChange={(e) =>
                      handleChange("links", {
                        ...profile.links,
                        github: e.target.value || undefined,
                      })
                    }
                    onFocus={() => setFocusedInput("github")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="https://github.com/username"
                    style={getInputStyle("github")}
                  />
                </div>
                <div>
                  <label htmlFor="zenn" style={snsInputGroupLabelStyle}>
                    Zenn
                  </label>
                  <input
                    id="zenn"
                    type="url"
                    value={profile.links.zenn || ""}
                    onChange={(e) =>
                      handleChange("links", {
                        ...profile.links,
                        zenn: e.target.value || undefined,
                      })
                    }
                    onFocus={() => setFocusedInput("zenn")}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="https://zenn.dev/username"
                    style={getInputStyle("zenn")}
                  />
                </div>
              </div>
            </div>

            <div style={formActionsStyle}>
              <button
                type="button"
                onClick={() => router.back()}
                style={getCancelButtonStyle()}
                onMouseEnter={() => setHoveredButton("cancel")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                キャンセル
              </button>
              <button
                type="submit"
                style={getSubmitButtonStyle()}
                onMouseEnter={() => setHoveredButton("submit")}
                onMouseLeave={() => setHoveredButton(null)}
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
