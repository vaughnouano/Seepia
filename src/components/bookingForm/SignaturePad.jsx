"use client";

import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import styles from "./SignaturePad.module.css";

export default function SignaturePad({ onChange }) {
  const padRef = useRef(null);

  useEffect(() => {
    function resizeCanvas() {
      if (!padRef.current) return;

      const canvas = padRef.current.getCanvas();
      const data = padRef.current.toData(); // stroke data, not pixels — survives resize cleanly

      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);

      padRef.current.clear();
      if (data && data.length > 0) {
        padRef.current.fromData(data);
      }
    }

    resizeCanvas();

    let resizeTimeout;
    function handleResize() {
      // Debounced — iOS fires several resize events in quick succession
      // during a single scroll-triggered address-bar animation.
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  function handleEnd() {
    if (padRef.current.isEmpty()) {
      onChange("");
      return;
    }
    const dataUrl = padRef.current.getTrimmedCanvas().toDataURL("image/png");
    onChange(dataUrl);
  }

  function handleClear() {
    padRef.current.clear();
    onChange("");
  }

  return (
    <div className={styles.wrapper}>
      <SignatureCanvas
        ref={padRef}
        penColor="black"
        canvasProps={{ className: styles.canvas }}
        onEnd={handleEnd}
      />
      <button
        type="button"
        className={styles.clearButton}
        onClick={handleClear}
      >
        Clear
      </button>
    </div>
  );
}
