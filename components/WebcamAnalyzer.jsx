"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadFaceApiModels } from "@/lib/utils/faceApiConfig";
import { Camera, CameraOff, Gauge, UserRound } from "lucide-react";

const DETECTION_INTERVAL_MS = 1500;
const MAX_HISTORY = 12;

function getDominantExpression(expressions = {}) {
  let bestLabel = "neutral";
  let bestScore = -1;

  Object.entries(expressions).forEach(([label, score]) => {
    if (score > bestScore) {
      bestLabel = label;
      bestScore = score;
    }
  });

  return bestLabel;
}

function mapEmotionState(expression) {
  if (["fearful", "sad", "angry"].includes(expression)) {
    return "Stressed";
  }
  if (expression === "happy") {
    return "Confident";
  }
  return "Calm";
}

function getEyeContactFromBox(box, videoWidth, videoHeight) {
  if (!box || !videoWidth || !videoHeight) return false;

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  const normalizedX = centerX / videoWidth;
  const normalizedY = centerY / videoHeight;

  const xAligned = Math.abs(normalizedX - 0.5) <= 0.18;
  const yAligned = Math.abs(normalizedY - 0.5) <= 0.2;

  return xAligned && yAligned;
}

function calculateConfidenceScore(history) {
  if (!history.length) return 0;

  const eyeContactRatio =
    history.filter((item) => item.eyeContact).length / history.length;

  const emotionCounts = history.reduce((acc, item) => {
    acc[item.emotion] = (acc[item.emotion] || 0) + 1;
    return acc;
  }, {});

  const dominantCount = Math.max(...Object.values(emotionCounts));
  const emotionStability = dominantCount / history.length;

  const confidenceWeight =
    history.filter((item) => item.emotion === "Confident").length /
    history.length;

  const score =
    eyeContactRatio * 55 + emotionStability * 25 + confidenceWeight * 20;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function WebcamAnalyzer({ className = "", onSnapshot }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const historyRef = useRef([]);

  const [isRunning, setIsRunning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);
  const [eyeContact, setEyeContact] = useState(false);
  const [emotionState, setEmotionState] = useState("Calm");
  const [confidenceScore, setConfidenceScore] = useState(0);

  const statusTone = useMemo(() => {
    if (emotionState === "Confident")
      return "text-green-400 border-green-500/30 bg-green-500/10";
    if (emotionState === "Stressed")
      return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-cyan-300 border-cyan-500/30 bg-cyan-500/10";
  }, [emotionState]);

  const stopDetectionTimer = useCallback(() => {
    if (detectionTimerRef.current) {
      clearInterval(detectionTimerRef.current);
      detectionTimerRef.current = null;
    }
  }, []);

  const stopWebcam = useCallback(() => {
    stopDetectionTimer();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRunning(false);
    setFaceDetected(false);
    setEyeContact(false);
    setConfidenceScore(0);
  }, [stopDetectionTimer]);

  const runDetection = useCallback(async () => {
    try {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const faceapi = await loadFaceApiModels();
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.45,
          }),
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!detection) {
        setFaceDetected(false);
        setEyeContact(false);
        setEmotionState("Calm");
        historyRef.current = [
          ...historyRef.current,
          { eyeContact: false, emotion: "Calm" },
        ].slice(-MAX_HISTORY);
        const score = calculateConfidenceScore(historyRef.current);
        setConfidenceScore(score);
        onSnapshot?.({
          faceDetected: false,
          eyeContact: false,
          emotionState: "Calm",
          confidenceScore: score,
          timestamp: Date.now(),
        });
        return;
      }

      const dominantExpression = getDominantExpression(detection.expressions);
      const emotion = mapEmotionState(dominantExpression);
      const eyeContactGood = getEyeContactFromBox(
        detection.detection.box,
        video.videoWidth,
        video.videoHeight,
      );

      setFaceDetected(true);
      setEyeContact(eyeContactGood);
      setEmotionState(emotion);

      historyRef.current = [
        ...historyRef.current,
        { eyeContact: eyeContactGood, emotion },
      ].slice(-MAX_HISTORY);

      const score = calculateConfidenceScore(historyRef.current);
      setConfidenceScore(score);
      onSnapshot?.({
        faceDetected: true,
        eyeContact: eyeContactGood,
        emotionState: emotion,
        confidenceScore: score,
        timestamp: Date.now(),
      });
    } catch (detectionError) {
      console.error("Webcam analysis error:", detectionError);
      setError("Unable to analyze webcam feed in real-time.");
    }
  }, [onSnapshot]);

  const startWebcam = useCallback(async () => {
    try {
      setError("");
      setIsModelLoading(true);
      await loadFaceApiModels();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsRunning(true);
      historyRef.current = [];

      stopDetectionTimer();
      detectionTimerRef.current = setInterval(
        runDetection,
        DETECTION_INTERVAL_MS,
      );
    } catch (cameraError) {
      console.error("Camera/model initialization error:", cameraError);

      const message = String(cameraError?.message || "");
      const isModelFetchIssue =
        message.includes("/models/face-api") ||
        message.includes("404") ||
        message.toLowerCase().includes("failed to fetch");

      if (isModelFetchIssue) {
        setError(
          "Face analysis models are missing. Ensure files exist in /public/models/face-api and refresh.",
        );
      } else {
        setError(
          "Camera access denied or unavailable. Allow webcam permission and try again.",
        );
      }
      stopWebcam();
    } finally {
      setIsModelLoading(false);
    }
  }, [runDetection, stopDetectionTimer, stopWebcam]);

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return (
    <Card
      className={`border-primary/25 bg-card/80 backdrop-blur-xl ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <UserRound className="h-5 w-5 text-primary" />
            AI Camera Feedback
          </CardTitle>
          <Button
            onClick={isRunning ? stopWebcam : startWebcam}
            disabled={isModelLoading}
            size="sm"
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <CameraOff className="mr-2 h-4 w-4" /> Stop Camera
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                {isModelLoading ? "Loading Models..." : "Start Camera"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-black/60">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-[260px] w-full object-cover"
            />
            {!isRunning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                <p className="rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-xs text-white/80">
                  Camera is off
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Face Detected
              </p>
              <Badge
                className={
                  faceDetected
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }
              >
                {faceDetected ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Eye Contact
              </p>
              <Badge
                className={
                  eyeContact
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }
              >
                {eyeContact ? "Good" : "Poor"}
              </Badge>
              {!eyeContact && faceDetected && (
                <p className="mt-2 text-xs text-amber-300">
                  Maintain eye contact with the camera.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Emotion State
              </p>
              <Badge className={statusTone}>{emotionState}</Badge>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-primary" />
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Confidence Score
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">
                {confidenceScore}/100
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </p>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Behavioral analysis runs every{" "}
          {Math.round(DETECTION_INTERVAL_MS / 1000)}-
          {Math.round(DETECTION_INTERVAL_MS / 1000) + 1} seconds for
          performance.
        </p>
      </CardContent>
    </Card>
  );
}
