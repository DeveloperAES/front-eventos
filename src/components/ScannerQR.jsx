import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Swal from "sweetalert2";

export default function ScannerQR() {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText) {
      setScanResult(decodedText);
      scanner.clear(); // Detener cámara
    }

    function onScanError(err) {
      console.warn(err);
    }

    return () => {
      scanner.clear().catch(err => console.error("Error limpiando scanner", err));
    };
  }, []);

  useEffect(() => {
    if (scanResult) {
      handleValidation(scanResult);
    }
  }, [scanResult]);

  const handleValidation = async (decodedUrl) => {
    try {
      // Extraer el código del enlace (ej: .../validar/30ee6a89-e428-41ad-8edd-6acd1ef7b26d)
      const codigo = decodedUrl.split("/validar/")[1];
      if (!codigo) {
        Swal.fire("Código inválido", "El QR no contiene un formato válido", "error");
        return;
      }

      // Confirmar asistencia
      const confirm = await Swal.fire({
        title: "¿Registrar asistencia?",
        text: "¿Deseas marcar al participante como asistente?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
      });

      if (!confirm.isConfirmed) return;

      const response = await fetch(`http://localhost:4000/api/registros/validar/${codigo}`);
      const data = await response.json();

      if (data.ok) {
        Swal.fire("✅ Éxito", data.mensaje, "success");
      } else {
        Swal.fire("⚠️ Aviso", data.mensaje, "warning");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo validar el código QR", "error");
    } finally {
      setScanResult(null); // Reset para volver a escanear
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Escanear Código QR</h2>
      <div id="reader" style={{ width: "300px", margin: "auto" }}></div>
    </div>
  );
}
