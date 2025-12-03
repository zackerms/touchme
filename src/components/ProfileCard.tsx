"use client";

import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/types/profile";
import QRCodeDisplay from "./QRCodeDisplay";

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedLink, setFlippedLink] = useState<string | null>(null);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gyroEnabled) {
      return;
    }

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.rotationRate) {
        const { alpha, beta } = event.rotationRate;
        if (alpha !== null && beta !== null) {
          setRotation({
            x: Math.max(-20, Math.min(20, beta * 0.5)),
            y: Math.max(-20, Math.min(20, alpha * 0.5)),
          });
        }
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);
    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, [gyroEnabled]);

  const handleCardClick = () => {
    if (isFlipped) {
      // QRコード表示中にカードをタップしたら表面に戻る
      setIsFlipped(false);
      setFlippedLink(null);
    } else if (!gyroEnabled) {
      // ジャイロを有効にする
      setGyroEnabled(true);
    }
  };

  const handleSNSIconClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    if (isFlipped && flippedLink === link) {
      setIsFlipped(false);
      setFlippedLink(null);
    } else {
      setFlippedLink(link);
      setIsFlipped(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const getSNSIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "𝕏";
      case "github":
        return "⚡";
      case "zenn":
        return "Z";
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
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 30px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04)",
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
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
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
      background: isHovered
        ? "#f0f0f0"
        : "#ffffff",
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
    <div
      ref={cardRef}
      style={cardContainerStyle}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div style={cardStyle}>
        <div style={cardFrontStyle}>
          <div style={imageContainerStyle}>
            <img
              src={profile.imageUrl || "/api/placeholder/200/200"}
              alt={profile.name}
              style={profileImageStyle}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23999' width='200' height='200'/%3E%3Ctext fill='%23fff' font-family='sans-serif' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <h2 style={nameStyle}>{profile.name}</h2>
          <div style={snsIconsStyle}>
            {profile.links.twitter && (
              <button
                style={getSNSButtonStyle("twitter")}
                onClick={(e) => handleSNSIconClick(e, profile.links.twitter!)}
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
                style={getSNSButtonStyle("github")}
                onClick={(e) => handleSNSIconClick(e, profile.links.github!)}
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
                style={getSNSButtonStyle("zenn")}
                onClick={(e) => handleSNSIconClick(e, profile.links.zenn!)}
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
          {flippedLink && (
            <div style={qrcodeWrapperStyle}>
              <div style={{ background: "white", padding: "12px", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15), 0 1px 4px rgba(0, 0, 0, 0.1)" }}>
                <QRCodeDisplay value={flippedLink} size={180} />
              </div>
              <p style={qrcodeLabelStyle}>スキャンしてリンクを開く</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
