import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

type DevicePayload = {
  id: string;
  modelCode: string;
  isIrnss: boolean;
  modelName: string;
  certifyingAuthority: string;
  tacCertificateNo: string;
  tacCertificateFileName?: string;
  tacApprovalDate?: string;
  tacExpiryDate?: string;
  copCertificateNo: string;
  copCertificateFileName?: string;
  copApprovalDate?: string;
  copExpiryDate?: string;
  permittedEsim: string[];
  status: "pending" | "approved";
  createdAt: string;
};

const ESIM_OPTIONS = [
  "APM GROUP PVT LTD",
  "CONTAINE TECHNOLOGIES LIMITED",
  "11TECHSQUARE PRIVATE LIMITED",
  "IoTivity Communications Pvt Ltd",
  "GTROPY Systems Private Limited",
  "Sensorise Smart Solutions Private Limited",
  "Taisys India Private Limited",
  "Techno Jacks International Private Limited",
];

export default function AddDevice() {
  const navigate = useNavigate();
  const [modelCode, setModelCode] = useState("");
  const [isIrnss, setIsIrnss] = useState(false);
  const [modelName, setModelName] = useState("");
  const [certifyingAuthority, setCertifyingAuthority] = useState("");

  const [tacCertificateNo, setTacCertificateNo] = useState("");
  const [tacFileName, setTacFileName] = useState<string | undefined>(undefined);
  const [tacApprovalDate, setTacApprovalDate] = useState("");
  const [tacExpiryDate, setTacExpiryDate] = useState("");

  const [copCertificateNo, setCopCertificateNo] = useState("");
  const [copFileName, setCopFileName] = useState<string | undefined>(undefined);
  const [copApprovalDate, setCopApprovalDate] = useState("");
  const [copExpiryDate, setCopExpiryDate] = useState("");

  const [permittedEsim, setPermittedEsim] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, setter: (name?: string) => void) {
    const f = e.target.files && e.target.files[0];
    setter(f ? f.name : undefined);
  }

  function toggleEsimOption(opt: string) {
    setPermittedEsim((prev) => (prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]));
  }

  function validate(): boolean {
    if (!modelCode.trim()) {
      setError("Model Code is required");
      return false;
    }
    if (!modelName.trim()) {
      setError("Model Name is required");
      return false;
    }
    if (!certifyingAuthority.trim()) {
      setError("Certifying Authority is required");
      return false;
    }
    if (!tacCertificateNo.trim()) {
      setError("TAC Certificate No is required");
      return false;
    }
    if (!tacFileName) {
      setError("TAC Certificate file must be uploaded");
      return false;
    }
    if (!tacApprovalDate) {
      setError("TAC Approval Date is required");
      return false;
    }
    if (!tacExpiryDate) {
      setError("TAC Expiry Date is required");
      return false;
    }
    if (!copCertificateNo.trim()) {
      setError("COP Certificate No is required");
      return false;
    }
    if (!copFileName) {
      setError("COP Certificate file must be uploaded");
      return false;
    }
    if (!copApprovalDate) {
      setError("COP Approval Date is required");
      return false;
    }
    if (!copExpiryDate) {
      setError("COP Expiry Date is required");
      return false;
    }
    // permitted ESIM can be empty
    setError(null);
    return true;
  }

  function handleSave() {
    if (!validate()) return;

    const payload: DevicePayload = {
      id: String(Date.now()),
      modelCode: modelCode.trim(),
      isIrnss,
      modelName: modelName.trim(),
      certifyingAuthority: certifyingAuthority.trim(),
      tacCertificateNo: tacCertificateNo.trim(),
      tacCertificateFileName: tacFileName,
      tacApprovalDate,
      tacExpiryDate,
      copCertificateNo: copCertificateNo.trim(),
      copCertificateFileName: copFileName,
      copApprovalDate,
      copExpiryDate,
      permittedEsim,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const key = "manufacturer_devices";
      const existing = JSON.parse(localStorage.getItem(key) || "[]") as DevicePayload[];
      localStorage.setItem(key, JSON.stringify([payload, ...existing]));
      navigate("/manufacturer/devices");
    } catch (err) {
      setError("Failed to save device locally");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Add Device / Device Approval</h2>
      </div>

      <Card>
        <div className="p-4 space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <section className="space-y-2">
            <h3 className="font-medium">Device identifiers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Model Code*</label>
                <input className="w-full border rounded px-2 py-1" value={modelCode} onChange={(e) => setModelCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Is IRNSS</label>
                <div className="mt-1">
                  <label className="inline-flex items-center mr-3">
                    <input type="checkbox" checked={isIrnss} onChange={(e) => setIsIrnss(e.target.checked)} className="mr-2" /> Yes
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm">Model Name*</label>
                <input className="w-full border rounded px-2 py-1" value={modelName} onChange={(e) => setModelName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Certifying Authority*</label>
                <input className="w-full border rounded px-2 py-1" value={certifyingAuthority} onChange={(e) => setCertifyingAuthority(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">TAC Certificate Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">TAC Certificate No*</label>
                <input className="w-full border rounded px-2 py-1" value={tacCertificateNo} onChange={(e) => setTacCertificateNo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Upload TAC Certificate*</label>
                <input type="file" className="mt-1" onChange={(e) => handleFileInput(e, setTacFileName)} />
                <div className="text-sm text-muted-foreground">{tacFileName || "No file chosen"}</div>
              </div>
              <div>
                <label className="block text-sm">Approval Date*</label>
                <input type="date" className="w-full border rounded px-2 py-1" value={tacApprovalDate} onChange={(e) => setTacApprovalDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Expiry Date*</label>
                <input type="date" className="w-full border rounded px-2 py-1" value={tacExpiryDate} onChange={(e) => setTacExpiryDate(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">COP Certificate Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">COP Certificate No*</label>
                <input className="w-full border rounded px-2 py-1" value={copCertificateNo} onChange={(e) => setCopCertificateNo(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Upload COP Certificate*</label>
                <input type="file" className="mt-1" onChange={(e) => handleFileInput(e, setCopFileName)} />
                <div className="text-sm text-muted-foreground">{copFileName || "No file chosen"}</div>
              </div>
              <div>
                <label className="block text-sm">Approval Date*</label>
                <input type="date" className="w-full border rounded px-2 py-1" value={copApprovalDate} onChange={(e) => setCopApprovalDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Expiry Date*</label>
                <input type="date" className="w-full border rounded px-2 py-1" value={copExpiryDate} onChange={(e) => setCopExpiryDate(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="font-medium">Permitted ESIM</h3>
            <div className="grid grid-cols-2 gap-2">
              {ESIM_OPTIONS.map((opt) => (
                <label key={opt} className="inline-flex items-center">
                  <input type="checkbox" checked={permittedEsim.includes(opt)} onChange={() => toggleEsimOption(opt)} className="mr-2" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
