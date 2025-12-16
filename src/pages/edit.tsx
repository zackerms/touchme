"use client";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
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
  const [isUploading, setIsUploading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (router.isReady) {
        if (id && typeof id === "string") {
          try {
            // 既存プロフィールの編集時は作成者チェック
            if (!storage.isMyProfile(id)) {
              alert("このプロフィールを編集する権限がありません");
              router.push("/");
              return;
            }

            const existing = await storage.getProfile(id);
            if (existing) {
              setProfile(existing);
            } else {
              alert("プロフィールが見つかりません");
              router.push("/");
            }
          } catch (error) {
            console.error("Failed to load profile:", error);
            alert("プロフィールの読み込みに失敗しました");
            router.push("/");
          }
        } else {
          // 新規作成時
          setProfile({
            id: storage.generateId(),
            name: "",
            imageUrl: "",
            links: {},
          });
        }
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [router.isReady, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert("名前を入力してください");
      return;
    }
    try {
      const isNewProfile = !id;
      await storage.saveProfile(profile);

      // 新規作成時は作成者IDとして保存
      if (isNewProfile) {
        storage.addMyProfileId(profile.id);
      }

      router.push(`/profile/${profile.id}`);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("プロフィールの保存に失敗しました");
    }
  };

  const handleChange = (
    field: keyof Profile | "links",
    value: string | Profile["links"],
  ) => {
    if (field === "links") {
      setProfile({ ...profile, links: value as Profile["links"] });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（4.5MB制限）
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
    if (file.size > maxSize) {
      alert(
        "ファイルサイズが大きすぎます。4.5MB以下のファイルを選択してください。",
      );
      e.target.value = "";
      return;
    }

    // 画像形式チェック
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("JPEG、PNG、またはWebP形式の画像を選択してください。");
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(
        `/api/avatar/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "アップロードに失敗しました");
      }

      const blob = await response.json();
      setProfile({ ...profile, imageUrl: blob.url });
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "画像のアップロードに失敗しました",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
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
    background: "rgba(255, 255, 255, 0.95)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
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
      background: isFocused ? "rgba(0, 0, 0, 0.04)" : "rgba(0, 0, 0, 0.02)",
      border: `1px solid ${isFocused ? "#6366f1" : "rgba(0, 0, 0, 0.1)"}`,
      borderRadius: "8px",
      color: "var(--foreground)",
      fontSize: "16px",
      boxSizing: "border-box",
      outline: "none",
    };
  };

  const imageUploadSectionStyle: React.CSSProperties = {
    marginBottom: "16px",
  };

  const fileInputWrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    width: "100%",
  };

  const fileInputStyle: React.CSSProperties = {
    position: "absolute",
    width: "0.1px",
    height: "0.1px",
    opacity: 0,
    overflow: "hidden",
    zIndex: -1,
  };

  const getUploadButtonStyle = (): React.CSSProperties => {
    const isHovered = hoveredButton === "upload";
    return {
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: isUploading ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      background: isUploading
        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
        : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
      opacity: isUploading ? 0.6 : 1,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transform:
        isHovered && !isUploading ? "translateY(-2px)" : "translateY(0)",
      boxShadow:
        isHovered && !isUploading
          ? "0 4px 12px rgba(59, 130, 246, 0.4)"
          : "0 2px 8px rgba(59, 130, 246, 0.2)",
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
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.2s ease",
      background: isHovered
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(255, 255, 255, 0.1)",
      color: "var(--foreground)",
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
      boxShadow: isHovered ? "0 4px 12px rgba(99, 102, 241, 0.4)" : "none",
    };
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>読み込み中... - HiTouch</title>
        </Head>
        <div style={loadingStyle}>読み込み中...</div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>
          {id ? "プロフィール編集" : "新規プロフィール作成"} - HiTouch
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
                プロフィール画像
              </label>
              <div style={imageUploadSectionStyle}>
                <div style={fileInputWrapperStyle}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    style={fileInputStyle}
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    style={getUploadButtonStyle()}
                    onMouseEnter={() =>
                      !isUploading && setHoveredButton("upload")
                    }
                    onMouseLeave={() => setHoveredButton(null)}
                  >
                    {isUploading ? (
                      <span>アップロード中...</span>
                    ) : (
                      <>
                        <span>📷</span>
                        <span>画像をアップロード</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div style={{ marginTop: "16px", marginBottom: "8px" }}>
                <label
                  htmlFor="imageUrl"
                  style={{
                    ...formGroupLabelStyle,
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  または、画像URLを直接入力
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
              </div>
              {profile.imageUrl && (
                <div style={imagePreviewStyle}>
                  <Image
                    src={profile.imageUrl}
                    alt="プレビュー"
                    width={100}
                    height={100}
                    style={imagePreviewImgStyle}
                  />
                </div>
              )}
            </div>

            <div style={formGroupStyle}>
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={formGroupLabelStyle}>SNSリンク</legend>
                <div style={snsInputsStyle}>
                  <div>
                    <label htmlFor="twitter" style={snsInputGroupLabelStyle}>
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
              </fieldset>
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
