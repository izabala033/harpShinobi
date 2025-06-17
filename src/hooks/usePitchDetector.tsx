import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";

export function usePitchDetector(minClarity: number = 0.95) {
  const [pitch, setPitch] = useState<string | null>(null);
  const [clarity, setClarity] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pitchDetectorRef = useRef<ReturnType<
    typeof PitchDetector.forFloat32Array
  > | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let analyser: AnalyserNode;
    let buffer: Float32Array;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaStreamRef.current = stream;

        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        mediaStreamSource.connect(analyser);

        buffer = new Float32Array(analyser.fftSize);
        pitchDetectorRef.current = PitchDetector.forFloat32Array(buffer.length);

        const updatePitch = async () => {
          if (audioContext.state === "suspended") {
            await audioContext.resume();
          }

          analyser.getFloatTimeDomainData(buffer);
          const [detectedPitch, detectedClarity] =
            pitchDetectorRef.current!.findPitch(
              buffer,
              audioContext.sampleRate
            );

          if (detectedClarity > minClarity) {
            setPitch(detectedPitch.toFixed(0));
            setClarity(detectedClarity.toFixed(2));
          } else {
            setPitch(null);
            setClarity(null);
          }

          rafIdRef.current = requestAnimationFrame(updatePitch);
        };

        updatePitch();
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    };

    initAudio();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      audioContextRef.current?.close();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [minClarity]);
  return { pitch, clarity };
}
