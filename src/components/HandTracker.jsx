import React, { useEffect, useRef } from 'react';
import { Hands } from '@mediapipe/hands';

export default function HandTracker({ onHandUpdate }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        let isTracking = true; // Strict Mode Kill-Switch
        let animationFrameId = null;
        let hands = null;

        // Your original smoothing variables
        let smoothedX = window.innerWidth / 2;
        let smoothedY = window.innerHeight / 2;

        const startAR = async () => {
            try {
                // 1. Initialize MediaPipe via NPM (replaces window.Hands)
                hands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
                });

                hands.setOptions({
                    maxNumHands: 1,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.7,
                    minTrackingConfidence: 0.7
                });

                hands.onResults((results) => {
                    if (!isTracking) return;
                    
                    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                        const landmarks = results.multiHandLandmarks[0];
                        const indexTip = landmarks[8]; 
                        const thumbTip = landmarks[4]; 

                        // Your exact calculation & Lerp Smoothing
                        const targetX = (1 - indexTip.x) * window.innerWidth;
                        const targetY = indexTip.y * window.innerHeight;

                        smoothedX += (targetX - smoothedX) * 0.15;
                        smoothedY += (targetY - smoothedY) * 0.15;

                        // Your exact Pinch Distance
                        const dx = indexTip.x - thumbTip.x;
                        const dy = indexTip.y - thumbTip.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const isPinching = distance < 0.07; 

                        onHandUpdate({ x: smoothedX, y: smoothedY, isPinching, active: true });
                    } else {
                        onHandUpdate({ active: false });
                    }
                });

                // 2. Request Camera
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });

                // CRITICAL FIX: If user disabled AR while waiting for camera, kill it instantly!
                if (!isTracking) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                videoElement.srcObject = stream;
                
                // 3. Process Frames manually (Bypasses buggy camera_utils package)
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    
                    const processFrame = async () => {
                        if (!isTracking) return;
                        if (videoElement.readyState >= 2 && videoElement.videoWidth > 0) {
                            await hands.send({ image: videoElement });
                        }
                        animationFrameId = requestAnimationFrame(processFrame);
                    };
                    processFrame();
                };

            } catch (err) {
                console.error("Camera access failed:", err);
            }
        };

        startAR();

        // 4. Guaranteed React 18 Cleanup
        return () => {
            isTracking = false; // Flags the async loop to stop instantly
            
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (hands) hands.close();
            
            if (videoElement && videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop(); // Physically turns off the light
                    track.enabled = false;
                });
                videoElement.srcObject = null;
            }
            
            onHandUpdate({ active: false });
        };
    }, []);

    // Opacity-0 ensures the browser processes frames, while display:none freezes modern browser decoders
    return (
        <video 
            ref={videoRef} 
            className="absolute opacity-0 pointer-events-none -z-50"
            style={{ width: '640px', height: '480px' }}
            autoPlay 
            playsInline 
            muted 
        />
    );
}