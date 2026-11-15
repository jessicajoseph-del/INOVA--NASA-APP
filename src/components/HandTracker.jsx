import React, { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';

export default function HandTracker({ stream, onHandUpdate, onError }) {
    const videoRef = useRef(null);
    const callbacksRef = useRef({ onHandUpdate, onError });

    useEffect(() => {
        callbacksRef.current = { onHandUpdate, onError };
    }, [onHandUpdate, onError]);

    useEffect(() => {
        const videoElement = videoRef.current;
        let isTracking = true;
        let animationFrameId = null;
        let hands = null;
        let ownedStream = null;
        let activeStream = stream || null;
        let wasHandVisible = false;
        let smoothedX = window.innerWidth / 2;
        let smoothedY = window.innerHeight / 2;

        const reportError = (error) => {
            if (!isTracking) return;
            console.error('Hand gesture tracking failed:', error);
            callbacksRef.current.onError?.(
                error instanceof Error ? error.message : 'Camera access failed. Please retry.'
            );
            callbacksRef.current.onHandUpdate?.({ active: false });
        };

        const startTracking = async () => {
            try {
                if (!activeStream) {
                    if (!navigator.mediaDevices?.getUserMedia) {
                        throw new Error('Camera access requires HTTPS or localhost.');
                    }
                    ownedStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 640, height: 480, facingMode: 'user' },
                    });
                    activeStream = ownedStream;
                }

                if (!isTracking) {
                    ownedStream?.getTracks().forEach((track) => track.stop());
                    return;
                }

                hands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                });
                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7,
                });

                hands.onResults((results) => {
                    if (!isTracking) return;

                    const landmarks = results.multiHandLandmarks?.[0];
                    if (!landmarks) {
                        if (wasHandVisible) {
                            wasHandVisible = false;
                            callbacksRef.current.onHandUpdate?.({ active: false });
                        }
                        return;
                    }
                    wasHandVisible = true;

                    const indexTip = landmarks[8];
                    const thumbTip = landmarks[4];
                    const targetX = (1 - indexTip.x) * window.innerWidth;
                    const targetY = indexTip.y * window.innerHeight;
                    smoothedX += (targetX - smoothedX) * 0.15;
                    smoothedY += (targetY - smoothedY) * 0.15;

                    const dx = indexTip.x - thumbTip.x;
                    const dy = indexTip.y - thumbTip.y;
                    const isPinching = Math.sqrt(dx * dx + dy * dy) < 0.07;
                    const isOpenPalm =
                        landmarks[8].y < landmarks[6].y &&
                        landmarks[12].y < landmarks[10].y &&
                        landmarks[16].y < landmarks[14].y &&
                        landmarks[20].y < landmarks[18].y;

                    callbacksRef.current.onHandUpdate?.({
                        x: smoothedX,
                        y: smoothedY,
                        isPinching,
                        isOpenPalm,
                        active: true,
                    });
                });

                if (!videoElement) throw new Error('The hand tracking camera could not be initialized.');
                videoElement.srcObject = activeStream;
                await videoElement.play();

                const processFrame = async () => {
                    if (!isTracking) return;
                    if (activeStream?.active && videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
                        try {
                            await hands.send({ image: videoElement });
                        } catch (error) {
                            reportError(error);
                            return;
                        }
                    }
                    if (isTracking) animationFrameId = requestAnimationFrame(processFrame);
                };
                void processFrame();
            } catch (error) {
                reportError(error);
            }
        };

        void startTracking();

        return () => {
            isTracking = false;
            if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
            if (hands) void hands.close();
            if (ownedStream) {
                ownedStream.getTracks().forEach((track) => track.stop());
            }
            if (videoElement) videoElement.srcObject = null;
            callbacksRef.current.onHandUpdate?.({ active: false });
        };
    }, [stream]);

    return (
        <video
            ref={videoRef}
            className="fixed left-[-10000px] top-0 pointer-events-none opacity-0"
            style={{ width: '640px', height: '480px' }}
            autoPlay
            playsInline
            muted
            aria-hidden="true"
        />
    );
}
