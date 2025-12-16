"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/types/profile";
import QRCodeDisplay from "./QRCodeDisplay";

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const currentRotationRef = useRef({ x: 0, y: 0 });

  // プロフィールURLを生成
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/profile/${profile.id}`;
      setProfileUrl(url);
    }
  }, [profile.id]);

  // ジャイロセンサーの自動有効化
  useEffect(() => {
    // デバイス検出
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasDeviceMotion = typeof DeviceMotionEvent !== "undefined";

    if (!isTouchDevice || !hasDeviceMotion) {
      // デスクトップまたは非対応デバイス
      console.log("ジャイロ非対応デバイス");
      return;
    }

    // iOS 13+ の許可リクエスト
    const requestPermission = async () => {
      const DeviceMotionEventWithPermission =
        DeviceMotionEvent as unknown as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<"granted" | "denied" | "default">;
        };
      if (
        typeof DeviceMotionEventWithPermission.requestPermission === "function"
      ) {
        // iOS Safari
        try {
          const permission =
            await DeviceMotionEventWithPermission.requestPermission();
          if (permission === "granted") {
            console.log("ジャイロ許可が得られました");
            setGyroEnabled(true);
          } else {
            console.log("ジャイロ許可が拒否されました");
          }
        } catch (error) {
          console.error("ジャイロ許可リクエストエラー:", error);
        }
      } else {
        // Android または iOS 12以下（許可不要）
        console.log("ジャイロ自動有効化（Android/iOS 12以下）");
        setGyroEnabled(true);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (!gyroEnabled) {
      return;
    }

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.rotationRate) {
        const { alpha, beta } = event.rotationRate;
        if (alpha !== null && beta !== null) {
          // 感度を調整（元の0.5より低めだが、反応性を確保）
          const sensitivity = 0.35;
          // スムージング係数（0.25 = 25%の変化を適用、75%は前の値を保持）
          const smoothing = 0.1;

          const targetX = Math.max(-20, Math.min(20, beta * sensitivity));
          const targetY = Math.max(-20, Math.min(20, alpha * sensitivity));

          // 前の値と現在の値をブレンドしてスムーズに
          const smoothedX =
            currentRotationRef.current.x * (1 - smoothing) +
            targetX * smoothing;
          const smoothedY =
            currentRotationRef.current.y * (1 - smoothing) +
            targetY * smoothing;

          // デバッグログ（開発時のみ）
          if (process.env.NODE_ENV === "development") {
            console.log("ジャイロイベント:", {
              alpha,
              beta,
              smoothedX,
              smoothedY,
            });
          }

          currentRotationRef.current = { x: smoothedX, y: smoothedY };
          setRotation({ x: smoothedX, y: smoothedY });
        }
      } else {
        // rotationRateが存在しない場合のデバッグログ
        if (process.env.NODE_ENV === "development") {
          console.warn("ジャイロイベント: rotationRateが存在しません", event);
        }
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);
    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, [gyroEnabled]);

  const handleCardClick = () => {
    // カードをクリックしたら、QRコード表示/非表示を切り替え
    setIsFlipped(!isFlipped);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  const handleSNSIconClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    // 新しいタブでSNSページを開く
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current || gyroEnabled) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    setRotation({
      x: Math.max(-20, Math.min(20, y * 10)),
      y: Math.max(-20, Math.min(20, x * 10)),
    });
  };

  const handleMouseLeave = () => {
    if (!gyroEnabled) {
      setRotation({ x: 0, y: 0 });
    }
  };

  const getSNSIcon = (platform: string): string | React.ReactNode => {
    switch (platform) {
      case "twitter":
        return "𝕏";
      case "github":
        return (
          <Image
            src="/github.svg"
            alt="GitHub"
            width={24}
            height={24}
            style={{
              objectFit: "contain",
            }}
          />
        );
      case "zenn":
        return (
          <Image
            src="/zenn.svg"
            alt="Zenn"
            width={24}
            height={24}
            style={{
              objectFit: "contain",
            }}
          />
        );
      default:
        return "?";
    }
  };

  const cardContainerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "400px",
    height: "500px",
    margin: "0 auto",
    perspective: "1000px",
    cursor: "pointer",
    transform: isFlipped
      ? "rotateY(180deg)"
      : `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
  };

  const cardStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s ease",
    transform: isFlipped ? "rotateY(180deg)" : "none",
  };

  const cardFaceStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    borderRadius: "20px",
    padding: "30px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--card-background)",
    border: "1px solid var(--card-border)",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 30px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04)",
  };

  const cardFrontStyle: React.CSSProperties = {
    ...cardFaceStyle,
    background: "var(--card-background)",
    backgroundImage: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
  };

  const cardBackStyle: React.CSSProperties = {
    ...cardFaceStyle,
    transform: "rotateY(180deg)",
    background: "var(--card-background)",
    backgroundImage: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
  };

  const imageContainerStyle: React.CSSProperties = {
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: "20px",
    border: "3px solid #e8e8e8",
  };

  const profileImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "bold",
    color: "var(--foreground)",
    marginBottom: "30px",
    textAlign: "center",
  };

  const snsIconsStyle: React.CSSProperties = {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const getSNSButtonStyle = (platform: string): React.CSSProperties => {
    const isHovered = hoveredButton === platform;
    return {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      border: "2px solid #e0e0e0",
      background: isHovered ? "#f0f0f0" : "#ffffff",
      color: "var(--foreground)",
      fontSize: "24px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: isHovered
        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
        : "0 2px 6px rgba(0, 0, 0, 0.1)",
      transform: isHovered ? "scale(1.1)" : "scale(1)",
    };
  };

  const qrcodeWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    transform: "rotateY(180deg)",
  };

  const qrcodeLabelStyle: React.CSSProperties = {
    color: "var(--foreground)",
    fontSize: "14px",
    textAlign: "center",
    opacity: 0.8,
  };

  return (
    <button
      ref={cardRef}
      type="button"
      style={{
        ...cardContainerStyle,
        border: "none",
        background: "transparent",
        padding: 0,
      }}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="プロフィールカードをクリックしてQRコードを表示"
    >
      <div style={cardStyle}>
        <div style={cardFrontStyle}>
          <div style={imageContainerStyle}>
            <Image
              src={
                profile.imageUrl ||
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23999' width='200' height='200'/%3E%3Ctext fill='%23fff' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"
              }
              alt={profile.name}
              width={200}
              height={200}
              style={profileImageStyle}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23999' width='200' height='200'/%3E%3Ctext fill='%23fff' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <h2 style={nameStyle}>{profile.name}</h2>
          <div style={snsIconsStyle}>
            {profile.links.twitter && (
              <button
                type="button"
                style={getSNSButtonStyle("twitter")}
                onClick={(e) => {
                  if (profile.links.twitter) {
                    handleSNSIconClick(e, profile.links.twitter);
                  }
                }}
                onMouseEnter={() => setHoveredButton("twitter")}
                onMouseLeave={() => setHoveredButton(null)}
                onMouseDown={() => setHoveredButton("twitter")}
                onMouseUp={() => setHoveredButton(null)}
                aria-label="Twitter"
              >
                {getSNSIcon("twitter")}
              </button>
            )}
            {profile.links.github && (
              <button
                type="button"
                style={getSNSButtonStyle("github")}
                onClick={(e) => {
                  if (profile.links.github) {
                    handleSNSIconClick(e, profile.links.github);
                  }
                }}
                onMouseEnter={() => setHoveredButton("github")}
                onMouseLeave={() => setHoveredButton(null)}
                onMouseDown={() => setHoveredButton("github")}
                onMouseUp={() => setHoveredButton(null)}
                aria-label="GitHub"
              >
                {getSNSIcon("github")}
              </button>
            )}
            {profile.links.zenn && (
              <button
                type="button"
                style={getSNSButtonStyle("zenn")}
                onClick={(e) => {
                  if (profile.links.zenn) {
                    handleSNSIconClick(e, profile.links.zenn);
                  }
                }}
                onMouseEnter={() => setHoveredButton("zenn")}
                onMouseLeave={() => setHoveredButton(null)}
                onMouseDown={() => setHoveredButton("zenn")}
                onMouseUp={() => setHoveredButton(null)}
                aria-label="Zenn"
              >
                {getSNSIcon("zenn")}
              </button>
            )}
          </div>
        </div>
        <div style={cardBackStyle}>
          {profileUrl && (
            <div style={qrcodeWrapperStyle}>
              <div
                style={{
                  background: "white",
                  padding: "12px",
                  borderRadius: "12px",
                  boxShadow:
                    "0 4px 16px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <QRCodeDisplay value={profileUrl} size={180} />
              </div>
              <p style={qrcodeLabelStyle}>プロフィールページを開く</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
