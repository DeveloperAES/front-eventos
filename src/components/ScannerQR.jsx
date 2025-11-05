import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Swal from "sweetalert2";

export default function ScannerQR() {
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode("reader");
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setIsScanning(true);
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) throw new Error("No se detectó cámara");

      const cameraId = cameras[0].id;

      await html5QrCodeRef.current.start(
        cameraId,
        { fps: 5, qrbox: 250 },
        onScanSuccess,
        onScanError
      );
    } catch (err) {
      console.error("Error iniciando cámara:", err);
      Swal.fire("Error", err.message, "error");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setIsScanning(false);
    }
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();

    const codigo = decodedText.split("/validar/")[1];
    if (!codigo) {
      Swal.fire("QR inválido", "El QR no contiene el formato esperado", "error");
      return startScanner();
    }

    const confirm = await Swal.fire({
      title: "¿Registrar asistencia?",
      text: "¿Deseas marcar al participante como asistente?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return startScanner();

    try {
      const res = await fetch(`http://localhost:4000/api/registros/validar/${codigo}`);
      const data = await res.json();

      if (data.ok) {
        Swal.fire("✅ Éxito", data.mensaje, "success");
      } else {
        Swal.fire("⚠️ Aviso", data.mensaje, "warning");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo validar el código QR", "error");
    }

    startScanner();
  };

  const onScanError = (err) => {
    // Silencioso para no llenar la consola
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Escanear Código QR</h2>
      <div id="reader" style={{ width: "320px", margin: "auto" }}></div>
      <button onClick={isScanning ? stopScanner : startScanner}>
        {isScanning ? "Detener escáner" : "Iniciar escáner"}
      </button>
    </div>
  );
}
