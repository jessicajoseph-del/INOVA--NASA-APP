"""
JARVIS-Style Touchless Desktop Application Backend
--------------------------------------------------
Tracks one hand via OpenCV and MediaPipe HandLandmarker.
Smoothes index fingertip coordinates using Exponential Moving Average (EMA).
Detects gestures:
  - POINT: Index extended, other fingers curled
  - PINCH: Thumb tip (4) & Index tip (8) distance < 0.05 (Click / Drag)
  - OPEN_PALM: All 5 fingers extended (Menu Toggle)
Broadcasts JSON payloads: { "x": x, "y": y, "gesture": gesture }
over WebSocket on ws://localhost:8765.
"""

import sys
import os
import time
import math
import json
import asyncio
import argparse
import threading
import cv2
import numpy as np

import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import websockets

# Configuration & Constants
DEFAULT_PORT = 8765
DEFAULT_HOST = "0.0.0.0"
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hand_landmarker.task")
ALPHA_SMOOTH = 0.35  # Exponential Moving Average factor (0.0 to 1.0)
PINCH_THRESHOLD = 0.055

# Global Shared State between CV thread and WebSocket server
shared_state = {
    "x": 0.5,
    "y": 0.5,
    "gesture": "IDLE",
    "pinch_distance": 1.0,
    "is_tracking": False,
    "fps": 0,
    "timestamp": 0,
}
state_lock = threading.Lock()
connected_clients = set()


def calculate_distance_2d(p1, p2):
    """Calculates Euclidean distance between two normalized landmarks."""
    return math.hypot(p1.x - p2.x, p1.y - p2.y)


def is_finger_extended(tip, pip, mcp, wrist):
    """
    Checks if a finger is extended relative to hand orientation.
    Measures distance from wrist to tip vs wrist to pip.
    """
    d_tip_wrist = math.hypot(tip.x - wrist.x, tip.y - wrist.y)
    d_pip_wrist = math.hypot(pip.x - wrist.x, pip.y - wrist.y)
    return d_tip_wrist > d_pip_wrist * 1.12


def detect_gesture(landmarks):
    """
    Detects hand gesture from 21 MediaPipe hand landmarks:
    - PINCH: Thumb tip (4) close to Index tip (8) (< PINCH_THRESHOLD)
    - POINT: Index extended, Middle/Ring/Pinky curled
    - OPEN_PALM: All 5 fingers extended
    """
    wrist = landmarks[0]
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    index_tip = landmarks[8]
    index_pip = landmarks[6]
    index_mcp = landmarks[5]
    middle_tip = landmarks[12]
    middle_pip = landmarks[10]
    middle_mcp = landmarks[9]
    ring_tip = landmarks[16]
    ring_pip = landmarks[14]
    ring_mcp = landmarks[13]
    pinky_tip = landmarks[20]
    pinky_pip = landmarks[18]
    pinky_mcp = landmarks[17]

    pinch_dist = calculate_distance_2d(thumb_tip, index_tip)

    # 1. PINCH Gesture (Highest priority for clicking / dragging)
    if pinch_dist < PINCH_THRESHOLD:
        return "PINCH", pinch_dist

    index_ext = is_finger_extended(index_tip, index_pip, index_mcp, wrist)
    middle_ext = is_finger_extended(middle_tip, middle_pip, middle_mcp, wrist)
    ring_ext = is_finger_extended(ring_tip, ring_pip, ring_mcp, wrist)
    pinky_ext = is_finger_extended(pinky_tip, pinky_pip, pinky_mcp, wrist)
    
    # Thumb extended check
    d_thumb_wrist = math.hypot(thumb_tip.x - wrist.x, thumb_tip.y - wrist.y)
    d_thumb_ip_wrist = math.hypot(thumb_ip.x - wrist.x, thumb_ip.y - wrist.y)
    thumb_ext = d_thumb_wrist > d_thumb_ip_wrist * 1.08

    # 2. OPEN_PALM Gesture (Menu Toggle: all 5 extended)
    if index_ext and middle_ext and ring_ext and pinky_ext and thumb_ext:
        return "OPEN_PALM", pinch_dist

    # 3. POINT Gesture (Index extended, others curled)
    if index_ext and not middle_ext and not ring_ext and not pinky_ext:
        return "POINT", pinch_dist

    # Neutral / Open 4 fingers without thumb
    if index_ext and middle_ext and ring_ext and pinky_ext:
        return "OPEN_PALM", pinch_dist

    return "IDLE", pinch_dist


def camera_tracker_worker(camera_idx=0, show_window=True):
    """OpenCV Hand Tracking Loop running in background thread."""
    global shared_state

    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] MediaPipe model not found at: {MODEL_PATH}")
        return

    print(f"[INFO] Initializing MediaPipe HandLandmarker from: {MODEL_PATH}")
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.55,
        min_hand_presence_confidence=0.55,
        min_tracking_confidence=0.55,
    )
    detector = vision.HandLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(camera_idx)
    if not cap.isOpened():
        print(f"[ERROR] Cannot open webcam index {camera_idx}")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 60)

    print(f"[INFO] Webcam {camera_idx} active. Tracking hand gestures...")
    print("[INFO] GESTURES: [POINT] = Cursor Move | [PINCH] = Click/Drag | [OPEN_PALM] = Menu Toggle")

    # Exponential Moving Average smooth coordinates
    smooth_x = None
    smooth_y = None
    prev_time = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.01)
                continue

            # Mirror flip frame horizontally so user movement is intuitive
            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape

            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

            # Detect hand landmarks
            detection_result = detector.detect(mp_image)

            current_time = time.time()
            fps = 1.0 / max(current_time - prev_time, 0.001)
            prev_time = current_time

            gesture = "IDLE"
            pinch_dist = 1.0
            is_tracking = False

            if detection_result.hand_landmarks and len(detection_result.hand_landmarks) > 0:
                is_tracking = True
                landmarks = detection_result.hand_landmarks[0]

                # Index fingertip is landmark 8
                raw_x = landmarks[8].x
                raw_y = landmarks[8].y

                # Exponential Moving Average Smoothing
                if smooth_x is None or smooth_y is None:
                    smooth_x = raw_x
                    smooth_y = raw_y
                else:
                    smooth_x = ALPHA_SMOOTH * raw_x + (1.0 - ALPHA_SMOOTH) * smooth_x
                    smooth_y = ALPHA_SMOOTH * raw_y + (1.0 - ALPHA_SMOOTH) * smooth_y

                gesture, pinch_dist = detect_gesture(landmarks)

                with state_lock:
                    shared_state["x"] = float(np.clip(smooth_x, 0.0, 1.0))
                    shared_state["y"] = float(np.clip(smooth_y, 0.0, 1.0))
                    shared_state["gesture"] = gesture
                    shared_state["pinch_distance"] = float(pinch_dist)
                    shared_state["is_tracking"] = True
                    shared_state["fps"] = round(fps, 1)
                    shared_state["timestamp"] = current_time

                # Draw Visuals on Camera Window if enabled
                if show_window:
                    # Draw skeletal connections
                    connections = [
                        (0, 1), (1, 2), (2, 3), (3, 4),        # Thumb
                        (0, 5), (5, 6), (6, 7), (7, 8),        # Index
                        (0, 9), (9, 10), (10, 11), (11, 12),   # Middle
                        (0, 13), (13, 14), (14, 15), (15, 16), # Ring
                        (0, 17), (17, 18), (18, 19), (19, 20), # Pinky
                        (5, 9), (9, 13), (13, 17)              # Palm base
                    ]
                    for p1_idx, p2_idx in connections:
                        p1 = landmarks[p1_idx]
                        p2 = landmarks[p2_idx]
                        cv2.line(frame, (int(p1.x * w), int(p1.y * h)), (int(p2.x * w), int(p2.y * h)), (0, 180, 255), 2)

                    # Highlight landmarks
                    for idx, lm in enumerate(landmarks):
                        cx, cy = int(lm.x * w), int(lm.y * h)
                        if idx == 8:  # Index Tip
                            cv2.circle(frame, (cx, cy), 12, (0, 255, 255), -1)
                            cv2.circle(frame, (cx, cy), 18, (0, 216, 255), 2)
                        elif idx == 4:  # Thumb Tip
                            cv2.circle(frame, (cx, cy), 9, (0, 100, 255), -1)
                        else:
                            cv2.circle(frame, (cx, cy), 4, (0, 255, 128), -1)

                    # Draw Smoothed Cursor Target Reticle
                    scx, scy = int(smooth_x * w), int(smooth_y * h)
                    cv2.drawMarker(frame, (scx, scy), (0, 255, 255), cv2.MARKER_CROSS, 28, 2)
                    cv2.circle(frame, (scx, scy), 22, (0, 255, 255), 1)

                    # Pinch distance visual line
                    t_pt = (int(landmarks[4].x * w), int(landmarks[4].y * h))
                    i_pt = (int(landmarks[8].x * w), int(landmarks[8].y * h))
                    pinch_color = (0, 255, 0) if pinch_dist < PINCH_THRESHOLD else (0, 165, 255)
                    cv2.line(frame, t_pt, i_pt, pinch_color, 2)
            else:
                with state_lock:
                    shared_state["is_tracking"] = False
                    shared_state["fps"] = round(fps, 1)

            if show_window:
                # JARVIS HUD Style HUD Overlay Box
                cv2.rectangle(frame, (16, 16), (420, 130), (10, 15, 25), -1)
                cv2.rectangle(frame, (16, 16), (420, 130), (0, 216, 255), 1)

                status_color = (0, 255, 128) if is_tracking else (0, 0, 255)
                cv2.putText(frame, "JARVIS TOUCHLESS TRACKER", (30, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 216, 255), 2)
                cv2.putText(frame, f"STATUS: {'LOCKED' if is_tracking else 'SEARCHING'}", (30, 68), cv2.FONT_HERSHEY_SIMPLEX, 0.5, status_color, 1)
                cv2.putText(frame, f"GESTURE: {gesture}", (30, 92), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                cv2.putText(frame, f"FPS: {round(fps, 1)}  |  WS: 8765", (30, 114), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)

                cv2.imshow("JARVIS Hand Tracker (Press Q to close preview)", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    print("[INFO] Camera preview window closed by user.")
                    show_window = False
                    cv2.destroyAllWindows()

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("[INFO] Camera released.")


async def ws_handler(websocket):
    """Handles each connected frontend WebSocket client."""
    global connected_clients
    connected_clients.add(websocket)
    client_addr = websocket.remote_address
    print(f"[WS] Client connected from {client_addr}. Active clients: {len(connected_clients)}")

    try:
        while True:
            # Send current smoothed hand tracking payload at ~60Hz
            with state_lock:
                payload = {
                    "x": round(shared_state["x"], 4),
                    "y": round(shared_state["y"], 4),
                    "gesture": shared_state["gesture"],
                    "is_tracking": shared_state["is_tracking"],
                    "pinch_distance": round(shared_state["pinch_distance"], 4),
                    "fps": shared_state["fps"],
                    "timestamp": shared_state["timestamp"],
                }

            await websocket.send(json.dumps(payload))
            await asyncio.sleep(0.016)  # ~60 FPS update rate

    except (websockets.exceptions.ConnectionClosed, websockets.exceptions.ConnectionClosedOK, asyncio.CancelledError):
        pass
    finally:
        connected_clients.remove(websocket)
        print(f"[WS] Client disconnected {client_addr}. Active clients: {len(connected_clients)}")


async def run_server(host, port):
    """Starts the WebSocket broadcast server."""
    print(f"[WS] Starting JARVIS WebSocket server on ws://{host}:{port}")
    async with websockets.serve(ws_handler, host, port):
        await asyncio.Future()  # Run forever


def main():
    parser = argparse.ArgumentParser(description="JARVIS Touchless Hand Tracker")
    parser.add_argument("--camera", type=int, default=0, help="Camera device index (default: 0)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="WebSocket port (default: 8765)")
    parser.add_argument("--host", type=str, default=DEFAULT_HOST, help="WebSocket host (default: 0.0.0.0)")
    parser.add_argument("--no-window", action="store_true", help="Run without OpenCV GUI preview window")
    args = parser.parse_args()

    # Start camera worker thread
    cam_thread = threading.Thread(
        target=camera_tracker_worker,
        args=(args.camera, not args.no_window),
        daemon=True,
    )
    cam_thread.start()

    # Start asyncio websocket loop on main thread
    try:
        asyncio.run(run_server(args.host, args.port))
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down JARVIS tracker...")
        sys.exit(0)


if __name__ == "__main__":
    main()

