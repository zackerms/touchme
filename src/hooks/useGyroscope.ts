import { useEffect, useRef, useState, useCallback } from "react";

interface GyroscopeRotation {
  x: number;
  y: number;
}

interface UseGyroscopeOptions {
  sensitivity?: number;
  smoothing?: number;
  maxRotation?: number;
}

interface UseGyroscopeReturn {
  rotation: GyroscopeRotation;
  gyroEnabled: boolean;
  setRotation: (rotation: GyroscopeRotation) => void;
  resetRotation: () => void;
}

export function useGyroscope(
  options: UseGyroscopeOptions = {}
): UseGyroscopeReturn {
  const {
    sensitivity = 0.35,
    smoothing = 0.1,
    maxRotation = 20,
  } = options;

  const [rotation, setRotation] = useState<GyroscopeRotation>({ x: 0, y: 0 });
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const currentRotationRef = useRef({ x: 0, y: 0 });

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
      if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
        // iOS Safari
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
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

  // デバイスモーションイベントのリスニング
  useEffect(() => {
    if (!gyroEnabled) {
      return;
    }

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.rotationRate) {
        const { beta, gamma } = event.rotationRate;
        if (beta !== null && gamma !== null) {
          const targetX = Math.max(
            -maxRotation,
            Math.min(maxRotation, beta * sensitivity)
          );
          const targetY = Math.max(
            -maxRotation,
            Math.min(maxRotation, gamma * sensitivity)
          );

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
              beta,
              gamma,
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
  }, [gyroEnabled, sensitivity, smoothing, maxRotation]);

  // 手動でrotationを設定する関数（マウスムーブ用）
  const setRotationManual = useCallback(
    (newRotation: GyroscopeRotation) => {
      if (!gyroEnabled) {
        currentRotationRef.current = newRotation;
        setRotation(newRotation);
      }
    },
    [gyroEnabled]
  );

  // rotationをリセットする関数
  const resetRotation = useCallback(() => {
    if (!gyroEnabled) {
      currentRotationRef.current = { x: 0, y: 0 };
      setRotation({ x: 0, y: 0 });
    }
  }, [gyroEnabled]);

  return {
    rotation,
    gyroEnabled,
    setRotation: setRotationManual,
    resetRotation,
  };
}
