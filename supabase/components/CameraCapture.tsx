```tsx
'use client';
import { useRef, useState, useEffect } from 'react';

export default function CameraCapture({
  onCapture,
}: { onCapture: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 640 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch { alert('Camera not available. You can upload a photo instead.'); }
  }

  function snap() {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d')!;
    const size = Math.min(video.videoWidth, video.videoHeight);
    ctx.drawImage(video, (video.videoWidth - size)/2, (video.videoHeight - size)/2,
                  size, size, 0, 0, 400, 400);
    const url = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(url);
    onCapture(url);
    (video.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
    setStreaming(false);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result as string); onCapture(reader.result as string); };
    reader.readAsDataURL(file);
  }

  useEffect(() => () => {
    if (videoRef.current?.srcObject)
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Passport Photograph *</p>
      {preview ? (
        <img src={preview} alt="passport" className="w-32 h-32 rounded-lg object-cover border-2 border-indigo-500" />
      ) : (
        <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
          No photo yet
        </div>
      )}
      <video ref={videoRef} className={`w-full max-w-xs rounded-lg ${streaming ? '' : 'hidden'}`} playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex flex-wrap gap-2">
        {!streaming && !preview && (
          <button type="button" onClick={startCam}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">
            📷 Use Camera
          </button>
        )}
        {streaming && (
          <button type="button" onClick={snap}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium">
            Capture
          </button>
        )}
        <label className="px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium cursor-pointer">
          Upload Photo
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
      </div>
    </div>
  );
}
```