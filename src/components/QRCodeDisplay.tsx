import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export default function QRCodeDisplay({
  value,
  size = 200,
}: QRCodeDisplayProps) {
  const containerStyle: React.CSSProperties = {
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  };

  return (
    <div style={containerStyle}>
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}
