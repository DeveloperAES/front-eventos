import React, { useEffect, useRef, useState } from "react";

// Requisitos:
// npm install jsqr
// o yarn add jsqr
// Este componente usa getUserMedia + jsQR para leer códigos QR desde la cámara.

// Props:
// - onDecode(data: string) => void         : callback cuando se detecta un QR válido
// - facingMode: "environment" | "user"   : cámara por defecto (environment = trasera)
// - scanInterval: number (ms)              : cada cuanto se procesa un frame (por defecto 300ms)
// - className: string                      : clases tailwind adicionales para el container

import jsQR from "jsqr";

export default function LectorQR({
  onDecode = (d) => console.log("QR:", d),
  facingMode = "environment",
  scanInterval = 300,
  className = "",
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  const [permissionGranted, setPermissionGranted] = useState(null); // null / true / false
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [currentFacing, setCurrentFacing] = useState(facingMode);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // if selectedDeviceId changes, restart camera
    if (selectedDeviceId) {
      startCamera({ deviceId: selectedDeviceId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  async function enumerateCameras() {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === "videoinput");
      setDevices(cams);
      return cams;
    } catch (e) {
      console.warn("No se pudieron listar dispositivos:", e);
      return [];
    }
  }

  async function startCamera(opts = {}) {
    stopCamera();
    setError(null);

    const constraints = {
      video: opts.deviceId
        ? { deviceId: { exact: opts.deviceId } }
        : { facingMode: { exact: currentFacing } },
      audio: false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setPermissionGranted(true);
      setScanning(true);
      scheduleScan();
      // load devices list (useful to show switch UI)
      enumerateCameras();
    } catch (err) {
      setPermissionGranted(false);
      setError(err.message || String(err));
      console.error("startCamera error", err);
    }
  }

  function stopCamera() {
    setScanning(false);
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      } catch (e) {
        // ignore
      }
    }
  }

  function scheduleScan() {
    if (!scanning) return;
    scanTimerRef.current = setTimeout(() => {
      scanFrame();
      scheduleScan();
    }, scanInterval);
  }

  function scanFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    try {
      ctx.drawImage(video, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: "attemptBoth",
      });
      if (code) {
        // Dibuja un rectángulo en el canvas para feedback visual
        drawBoundingBox(ctx, code.location);
        onDecode(code.data);
        // opcional: detener o pausar escaneo tras leer
        // stopCamera();
      }
    } catch (e) {
      // puede fallar en cross-origin canvases o cuando la cámara se detiene
      console.warn("scanFrame error", e);
    }
  }

  function drawBoundingBox(ctx, loc) {
    if (!loc) return;
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = Math.max(2, Math.min(ctx.canvas.width, ctx.canvas.height) * 0.01);
    ctx.beginPath();
    ctx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
    ctx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
    ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
    ctx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
    ctx.closePath();
    ctx.stroke();
  }

  async function toggleFacing() {
    // si hay varios devices, alternar por deviceId preferentemente
    const cams = await enumerateCameras();
    if (cams.length <= 1) return;

    // Try to find a camera with 'back' or 'rear' in label, otherwise toggle facing
    const currentIdx = cams.findIndex((c) => c.deviceId === selectedDeviceId);
    const nextIdx = currentIdx === -1 || currentIdx === cams.length - 1 ? 0 : currentIdx + 1;
    setSelectedDeviceId(cams[nextIdx].deviceId);
  }

  async function enableFlashlight() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const capabilities = track.getCapabilities && track.getCapabilities();
    if (capabilities && capabilities.torch) {
      try {
        await track.applyConstraints({ advanced: [{ torch: true }] });
      } catch (e) {
        console.warn("No se pudo activar la linterna:", e);
      }
    } else {
      alert("Linterna no soportada en este dispositivo / navegador");
    }
  }

  return (
    <div className={`w-full max-w-lg mx-auto p-4 bg-white rounded-2xl shadow ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Lector QR</h3>
        <div className="flex gap-2 items-center">
          {!scanning ? (
            <button
              className="px-3 py-1 rounded bg-green-600 text-white text-sm"
              onClick={() => startCamera()}
            >
              Iniciar
            </button>
          ) : (
            <button
              className="px-3 py-1 rounded bg-red-600 text-white text-sm"
              onClick={() => stopCamera()}
            >
              Detener
            </button>
          )}
          <button
            className="px-3 py-1 rounded bg-slate-100 text-sm"
            onClick={() => toggleFacing()}
            title="Cambiar cámara"
          >
            Cambiar cámara
          </button>
        </div>
      </div>

      <div className="relative bg-black rounded overflow-hidden" style={{ paddingTop: "56.25%" }}>
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        {!permissionGranted && permissionGranted !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-4">
            <div>
              <p className="mb-2">Permiso denegado para acceder a la cámara.</p>
              <p className="text-sm opacity-80">Habilítalo desde la configuración del navegador o dispositivo.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-slate-600">
        <p>Estado: {scanning ? "Escaneando" : "Detenido"}</p>
        {error && <p className="text-red-600">Error: {error}</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-2 rounded bg-slate-100 text-sm"
          onClick={() => enableFlashlight()}
        >
          Linterna
        </button>

        <select
          className="px-2 py-1 rounded border text-sm"
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          value={selectedDeviceId || ""}
        >
          <option value="">Seleccionar cámara (opcional)</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Cámara ${d.deviceId}`}
            </option>
          ))}
        </select>

        <button
          className="px-3 py-2 rounded bg-slate-100 text-sm"
          onClick={() => {
            // Forzar un escaneo inmediato
            scanFrame();
          }}
        >
          Escanear ahora
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        <p>
          Nota: este lector requiere que el usuario permita acceso a la cámara. Para usos en producción
          revisa permisos, https y manejo de errores. Para lectura en segundo plano en móviles necesitas
          soluciones nativas.
        </p>
      </div>
    </div>
  );
}
