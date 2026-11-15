import React, { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function PalmMouse({ enabled = false, onSwipeNext, onSwipePrev }) {
  const videoRef = useRef(null);
  const [cursor, setCursor] = useState({ x: -100, y: -100, isClicking: false });
  const [status, setStatus] = useState("Initializing AR palm sensors...");
  const [swipeFeedback, setSwipeFeedback] = useState(null);

  const wasClickingRef = useRef(false);
  const smoothedPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const prevSwipeXRef = useRef(null);
  const lastSwipeTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let handLandmarker = null;
    let animationFrameId = null;
    let activeStream = null;
    let isCancelled = false;

    const COOLDOWN_MS = 1000;
    const SWIPE_THRESHOLD = 0.15;

    async function setupTracker() {
      try {
        setStatus("Loading offline hand model...");
        const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");

        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/mediapipe/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });

        if (isCancelled) return;

        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });

        if (videoRef.current && !isCancelled) {
          videoRef.current.srcObject = activeStream;
          videoRef.current.onloadeddata = () => {
            setStatus("Open palm: move • Fist: click • Swipe: step");
            predictLoop();
          };
        }
      } catch (err) {
        console.error("AR Palm Tracker Error:", err);
        setStatus("Camera unavailable — check permissions");
      }
    }

    function predictLoop() {
      const video = videoRef.current;
      if (video && handLandmarker && video.readyState >= 2 && !isCancelled) {
        const now = performance.now();
        const results = handLandmarker.detectForVideo(video, now);

        if (results.landmarks && results.landmarks.length > 0) {
          const lms = results.landmarks[0];

          // Landmark 9 = middle finger MCP (palm center), mirrored X for natural movement
          const rawX = (1 - lms[9].x) * window.innerWidth;
          const rawY = lms[9].y * window.innerHeight;

          // Damped lerp smoothing so 3D organ hover & cursor feel fluid
          smoothedPosRef.current.x += (rawX - smoothedPosRef.current.x) * 0.25;
          smoothedPosRef.current.y += (rawY - smoothedPosRef.current.y) * 0.25;

          const screenX = smoothedPosRef.current.x;
          const screenY = smoothedPosRef.current.y;

          // Closed fist check: all 4 fingertips below their PIP middle joints
          const isFist =
            lms[8].y > lms[6].y &&
            lms[12].y > lms[10].y &&
            lms[16].y > lms[14].y &&
            lms[20].y > lms[18].y;

          // Open palm check: all 4 fingertips raised above their PIP middle joints
          const isOpenPalm =
            lms[8].y < lms[6].y &&
            lms[12].y < lms[10].y &&
            lms[16].y < lms[14].y &&
            lms[20].y < lms[18].y;

          setCursor({ x: screenX, y: screenY, isClicking: isFist });

          // Dispatch synthetic pointermove so Three.js OrganRaycaster detects hover
          window.dispatchEvent(
            new PointerEvent("pointermove", {
              clientX: screenX,
              clientY: screenY,
              bubbles: true,
            })
          );

          // Trigger DOM / Three.js click once on transition from open hand -> closed fist
          if (isFist && !wasClickingRef.current) {
            triggerClickAt(screenX, screenY);
          }
          wasClickingRef.current = isFist;

          // Horizontal Palm Swipe Detection (for stepping through Health Briefing)
          if (isOpenPalm) {
            const mirroredPalmX = 1 - lms[9].x;
            if (
              prevSwipeXRef.current !== null &&
              now - lastSwipeTimeRef.current > COOLDOWN_MS
            ) {
              const deltaX = mirroredPalmX - prevSwipeXRef.current;
              if (deltaX > SWIPE_THRESHOLD) {
                lastSwipeTimeRef.current = now;
                triggerSwipe("NEXT >>", onSwipeNext);
              } else if (deltaX < -SWIPE_THRESHOLD) {
                lastSwipeTimeRef.current = now;
                triggerSwipe("<< PREV", onSwipePrev);
              }
            }
            prevSwipeXRef.current = mirroredPalmX;
          } else {
            prevSwipeXRef.current = null;
          }
        }
      }
      animationFrameId = requestAnimationFrame(predictLoop);
    }

    function triggerSwipe(label, callback) {
      setSwipeFeedback(label);
      setTimeout(() => setSwipeFeedback(null), 650);
      if (typeof callback === "function") {
        callback();
      } else {
        window.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: label.includes("NEXT") ? "ArrowRight" : "ArrowLeft",
          })
        );
      }
    }

    function triggerClickAt(x, y) {
      const target = document.elementFromPoint(x, y);
      if (target) {
        target.dispatchEvent(
          new PointerEvent("pointerdown", { clientX: x, clientY: y, bubbles: true })
        );
        target.dispatchEvent(
          new PointerEvent("pointerup", { clientX: x, clientY: y, bubbles: true })
        );
        if (typeof target.click === "function") {
          target.click();
        }
      }
    }

    setupTracker();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarker) {
        handLandmarker.close();
      }
    };
  }, [enabled, onSwipeNext, onSwipePrev]);

  if (!enabled) return null;

  return (
    <>
      {/* Tactical AR Palm Reticle Cursor */}
      <div
        className="pointer-events-none fixed z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{ left: `${cursor.x}px`, top: `${cursor.y}px` }}
      >
        <div
          className={`flex items-center justify-center rounded-full border-2 transition-all duration-150 ${
            cursor.isClicking
              ? "h-7 w-7 scale-90 border-[#ead9b2] bg-[#ead9b2]/35 shadow-[0_0_20px_rgba(234,217,178,0.65)]"
              : "h-11 w-11 border-[#f6eedb] bg-[#f6eedb]/15 shadow-[0_0_16px_rgba(246,238,219,0.5)]"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              cursor.isClicking ? "bg-[#ead9b2]" : "bg-[#f6eedb]"
            }`}
          />
        </div>
        {swipeFeedback && (
          <span className="badge badge-primary badge-xs mt-1 whitespace-nowrap font-mono tracking-widest">
            {swipeFeedback}
          </span>
        )}
      </div>

      {/* Bottom-Right Mirrored Optical Sensor Feed */}
      <div className="fixed bottom-4 right-4 z-[9990] w-48 overflow-hidden rounded-xl border border-[#f6eedb]/30 bg-[#0a1c3f]/85 p-2 shadow-2xl backdrop-blur-xl">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#f6eedb]">
          <span>RIDGE AR PALM</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#ead9b2]" />
        </div>
        <div className="relative overflow-hidden rounded-lg border border-base-300 bg-base-100">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-28 w-full -scale-x-100 object-cover opacity-85"
          />
        </div>
        <p className="mt-1.5 truncate font-mono text-[10px] text-base-content/75">
          {status}
        </p>
      </div>
    </>
  );
}

