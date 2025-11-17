import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { Upload, Focus, HatGlasses, ListCollapse, Camera, ScanSearch } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Detection {
  name: string;
  confidence: number;
  box: [number, number, number, number];
}

interface DetectionResult {
  results?: {
    detections?: Detection[];
    imageWidth?: number; // optional, resolusi asli
    imageHeight?: number;
  }[];
}

const PPE = () => {
  const baseUrl = import.meta.env.VITE_API_PPE as string;
  const apiDetect = `${baseUrl}/detect`;

  const [file, setFile] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 🧠 Draw detections
  const drawDetections = (img: HTMLImageElement, detectionsRaw: Detection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    detectionsRaw.forEach((det) => {
      const { name, confidence, box } = det;
      let [x1, y1, x2, y2] = box;

      // batasi agar box tidak keluar canvas
      x1 = Math.max(0, x1);
      y1 = Math.max(0, y1);
      x2 = Math.min(canvas.width, x2);
      y2 = Math.min(canvas.height, y2);

      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      const label = `${name} ${(confidence * 100).toFixed(1)}%`;
      const textWidth = ctx.measureText(label).width;
      const textHeight = 18;

      ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
      ctx.fillRect(x1, y1 - textHeight, textWidth + 8, textHeight);

      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.fillText(label, x1 + 4, y1 - 5);
    });
  };

  // 🖼️ Update canvas setiap ada hasil baru
  useEffect(() => {
    if (!result || !file) return;
    const img = imgRef.current;
    const detectionsRaw = result.results?.[0]?.detections;
    if (!img || !detectionsRaw) return;

    if (img.complete) drawDetections(img, detectionsRaw);
    else img.onload = () => drawDetections(img, detectionsRaw);
  }, [result, file]);

  // 🚀 Upload file ke API
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(URL.createObjectURL(selected));
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selected);

    try {
      const res = await fetch(apiDetect, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data: DetectionResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Gagal deteksi:", err);
      alert("❌ Gagal melakukan deteksi. Pastikan backend aktif & file valid.");
    } finally {
      setLoading(false);
    }
  };

  const detections = result?.results?.[0]?.detections ?? [];

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Focus />
        <h2 className="text-2xl font-semibold text-gray-700">PPE Detection</h2>
      </div>

      <p className="text-sm text-gray-500">API Endpoint: {apiDetect}</p>

      <input
        id="file-upload"
        type="file"
        accept="image/*,.pdf"
        onChange={handleUpload}
        className="hidden"
      />

      <label
        htmlFor="file-upload"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 active:scale-95 transition"
      >
        <Upload className="w-4 h-4" />
        Upload File
      </label>

      {loading && <p className="text-blue-500 mt-2">🔍 Processing...</p>}

      {/* Grid preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Original */}
        <div className="border rounded-lg p-3 bg-gray-50 flex flex-col items-center justify-center text-center h-96 overflow-auto">
          {!file && (
            <div className="flex flex-col items-center gap-2">
              <Camera />
              <h3 className="font-semibold text-gray-700 mb-2 text-center">Gambar Asli</h3>
            </div>
          )}
          {file && (
            <img
              src={file}
              alt="Uploaded"
              className="rounded-lg max-w-full h-auto"
            />
          )}
        </div>

        {/* Detection */}
        <div className="border rounded-lg p-3 bg-gray-50 relative flex flex-col items-center justify-center text-center h-96 overflow-auto">
          {!result && (
            <div className="flex flex-col items-center gap-2">
              <ScanSearch />
              <h3 className="font-semibold text-gray-700 mb-2 text-center">Hasil Deteksi</h3>
            </div>
          )}
          {file && (
            <div className="relative inline-block">
              <img
                ref={imgRef}
                src={file}
                alt="Deteksi"
                className="rounded-lg max-w-full h-auto"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
                style={{ pointerEvents: "none" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Daftar deteksi */}
      {detections.length > 0 && (
        <div className="mt-6 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <HatGlasses className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-700">Daftar Deteksi:</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800 max-h-48 overflow-y-auto pr-2">
            {detections.map((det, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1 border border-gray-200 hover:bg-gray-100 transition"
              >
                <span className="font-medium text-blue-600">{index + 1}.</span>
                <span>{det.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accordion JSON */}
      {result && (
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="result">
              <AccordionTrigger className="font-semibold text-gray-700 text-lg">
                <ListCollapse /> Detail JSON
              </AccordionTrigger>
              <AccordionContent>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mt-2">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default PPE;
