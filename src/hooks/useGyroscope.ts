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
    sensitivity = 0.5,
    smoothing = 0.15,
    maxRotation = 20,
  } = options;

  const [rotation, setRotation] = useState<GyroscopeRotation>({ x: 0, y: 0 });
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const currentGamma = useRef<number>(0); // 左右の絶対角度

  // ジャイロセンサーの自動有効化
  useEffect(() => {
    // デバイス検出
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasDeviceOrientation = typeof DeviceOrientationEvent !== "undefined";
    const hasDeviceMotion = typeof DeviceMotionEvent !== "undefined";

    if (!isTouchDevice || !hasDeviceOrientation || !hasDeviceMotion) {
      // デスクトップまたは非対応デバイス
      console.log("ジャイロ非対応デバイス");
      return;
    }

    // iOS 13+ の許可リクエスト（両方のイベントに対して）
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        // iOS Safari
        try {
          const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
          const motionPermission = await (DeviceMotionEvent as any).requestPermission();
          
          if (orientationPermission === "granted" && motionPermission === "granted") {
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

  // デバイスオリエンテーションイベント：左右の傾き（絶対角度）
  useEffect(() => {
    if (!gyroEnabled) {
      return;
    }

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma; // 左右の傾き（-90〜90度）

      if (gamma !== null) {
        currentGamma.current = gamma;
        
        // gamma: 左右の傾き → rotateY
        const targetY = Math.max(
          -maxRotation,
          Math.min(maxRotation, gamma * sensitivity)
        );

        // 前の値と現在の値をブレンドしてスムーズに
        const smoothedY =
          currentRotationRef.current.y * (1 - smoothing) +
          targetY * smoothing;

        currentRotationRef.current = { 
          x: currentRotationRef.current.x, 
          y: smoothedY 
        };
        setRotation({ 
          x: currentRotationRef.current.x, 
          y: smoothedY 
        });

        // デバッグログ（開発時のみ）
        if (process.env.NODE_ENV === "development") {
          console.log("オリエンテーション:", {
            gamma,
            targetY,
            smoothedY,
          });
        }
      }
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [gyroEnabled, sensitivity, smoothing, maxRotation]);

  // デバイスモーションイベント：前後の勢い（角速度）
  useEffect(() => {
    if (!gyroEnabled) {
      return;
    }

    // 減衰係数（自然に0に戻る速度）
    const decay = 0.92;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.rotationRate) {
        const beta = event.rotationRate.beta; // 前後の角速度

        if (beta !== null) {
          // 角速度に基づいた回転値の変化（勢いだけを取得）
          const velocityX = beta * sensitivity * 0.3;
          
          // 現在の回転に勢いを加えて、減衰させる
          const newX = currentRotationRef.current.x * decay + velocityX;
          const clampedX = Math.max(-maxRotation, Math.min(maxRotation, newX));

          currentRotationRef.current = { 
            x: clampedX, 
            y: currentRotationRef.current.y 
          };
          setRotation({ 
            x: clampedX, 
            y: currentRotationRef.current.y 
          });

          // デバッグログ（開発時のみ）
          if (process.env.NODE_ENV === "development") {
            console.log("モーション:", {
              beta,
              velocityX,
              clampedX,
            });
          }
        }
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);
    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
    };
  }, [gyroEnabled, sensitivity, maxRotation]);

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
