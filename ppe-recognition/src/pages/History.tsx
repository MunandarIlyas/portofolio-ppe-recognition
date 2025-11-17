import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, XCircle, FileClock } from "lucide-react";

interface Detection {
  name: string;
  confidence: number;
  box: number[];
}

interface DetectionRecord {
  id: number;
  filename: string;
  image_path: string; 
  alert: boolean;
  acknowledge: boolean;
  description?: string;
  results: { page: number; detections: Detection[] }[];
}

const History = () => {
  const baseUrl = import.meta.env.VITE_API_PPE as string;
  const apiDetect = `${baseUrl}/detect`;

  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(apiDetect)
      .then((res) => res.json())
      .then((data: any[]) => {
        const parsed = data.map((r) => ({
          ...r,
          results: r.results ?? [],
        }));
        setRecords(parsed);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Fungsi ack record
  const handleAcknowledge = async (recordId: number) => {
    const record = records.find((r) => r.id === recordId);
    if (!record || record.acknowledge) return;

    try {
      const res = await fetch(`${apiDetect}/${recordId}/ack`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to acknowledge");

      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, acknowledge: true } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert("Gagal meng-acknowledge record");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex gap-2">
        <FileClock />
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">History</h2>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">File</th>
                <th className="px-4 py-2 border">Image</th>
                <th className="px-4 py-2 border">Alert</th>
                <th className="px-4 py-2 border">Acknowledge</th>
                <th className="px-4 py-2 border">Detections</th>
                <th className="px-4 py-2 border">Description</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}

              {records.map((record) => (
                <tr key={record.id} className="text-center border">
                  <td className="px-4 py-2 border">{record.id}</td>
                  <td className="px-4 py-2 border">{record.filename}</td>
                  <td className="px-4 py-2 border">
                    {record.image_path ? (
                      <img
                        src={`${baseUrl}${record.image_path}`}
                        alt={record.filename}
                        className="w-20 h-20 object-cover mx-auto rounded"
                      />
                    ) : (
                      "No image"
                    )}
                  </td>

                  {/* ALERT COLUMN */}
                  <td
                    className={`px-4 py-2 bg-red-100 border justify-center items-center ${
                      record.alert && !record.acknowledge ? "animate-blink" : ""
                    }`}
                    onClick={() => handleAcknowledge(record.id)}
                    style={{ cursor: record.acknowledge ? "default" : "pointer" }}
                  >
                    {record.alert ? (
                      <AlertCircle
                        className={`w-6 h-6 ${
                          record.acknowledge ? "text-red-500" : "text-yellow-500"
                        }`}
                      />
                    ) : (
                      <CheckCircle className="text-green-500 w-6 h-6" />
                    )}
                  </td>

                  {/* ACKNOWLEDGE COLUMN */}
                  <td className="px-4 py-2 border justify-center items-center">
                    {record.acknowledge ? (
                      <CheckCircle className="text-green-500 " />
                    ) : (
                      <XCircle className="text-gray-400 w-6 h-6" />
                    )}
                  </td>

                  {/* DETECTIONS */}
                  <td className="px-4 py-2 border text-left">
                    {record.results.length > 0 ? (
                      record.results.map((page) => (
                        <div key={page.page} className="mb-2">
                          <strong>Page {page.page}:</strong>
                          <ul className="ml-4 list-disc">
                            {page.detections?.length > 0 ? (
                              page.detections.map((det, idx) => (
                                <li key={idx}>
                                  {det.name} ({(det.confidence * 100).toFixed(1)}%)
                                </li>
                              ))
                            ) : (
                              <li>No detections</li>
                            )}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <span>No detections</span>
                    )}
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-4 py-2 border text-left">
                    {record.description ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(
                          JSON.parse(record.description).reduce<Record<string, number>>(
                            (acc, name: string) => {
                              acc[name] = (acc[name] || 0) + 1;
                              return acc;
                            }, {}
                          )
                        ).map(([name, count], idx) => (
                          <div
                            key={idx}
                            className="flex justify-between bg-gray-100 px-2 py-1 rounded"
                          >
                            <span>{name}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span>No detections</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
