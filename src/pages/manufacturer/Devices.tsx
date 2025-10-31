import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

type Device = {
  id: string;
  modelCode: string;
  modelName: string;
  certifyingAuthority: string;
  tacCertificateNo: string;
  copCertificateNo: string;
  status: "pending" | "approved";
};

const sampleDevices: Device[] = [
  {
    id: "1",
    modelCode: "RX-100",
    modelName: "RoadEye RX-100",
    certifyingAuthority: "Telecom Authority",
    tacCertificateNo: "TAC-000111",
    copCertificateNo: "COP-889900",
    status: "pending",
  },
  {
    id: "2",
    modelCode: "RX-200",
    modelName: "RoadEye RX-200",
    certifyingAuthority: "Communications Board",
    tacCertificateNo: "TAC-000222",
    copCertificateNo: "COP-778811",
    status: "approved",
  },
  {
    id: "3",
    modelCode: "RX-300",
    modelName: "RoadEye RX-300",
    certifyingAuthority: "Telecom Authority",
    tacCertificateNo: "TAC-000333",
    copCertificateNo: "COP-667788",
    status: "pending",
  },
];

export default function Devices() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sampleDevices.filter((d) => {
      if (filter === "pending" && d.status !== "pending") return false;
      if (filter === "approved" && d.status !== "approved") return false;
      if (!q) return true;
      return [d.modelCode, d.modelName, d.certifyingAuthority, d.tacCertificateNo, d.copCertificateNo]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, filter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const headers = ["modelCode", "modelName", "certifyingAuthority", "tacCertificateNo", "copCertificateNo"];
    const rows = [headers.join(","), ...filtered.map((d) => headers.map((h) => (d as any)[h]).join(","))];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "devices_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Device Approval List</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/manufacturer/add-device")}>Add Device</Button>
          <Button variant="ghost" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Top filters */}
      <div className="flex gap-2 items-center mb-4">
        <Button
          variant={filter === "all" ? undefined : "ghost"}
          onClick={() => setFilter("all")}
        >
          All Devices ({sampleDevices.length})
        </Button>
        <Button
          variant={filter === "pending" ? undefined : "ghost"}
          onClick={() => setFilter("pending")}
        >
          Pending Approval ({sampleDevices.filter((s) => s.status === "pending").length})
        </Button>
        <Button
          variant={filter === "approved" ? undefined : "ghost"}
          onClick={() => setFilter("approved")}
        >
          Approved Devices ({sampleDevices.filter((s) => s.status === "approved").length})
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-3 py-1"
                placeholder="Search model code, name or certifying authority"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">Total: {total}</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="border-b p-2">Model Code</th>
                  <th className="border-b p-2">Model Name</th>
                  <th className="border-b p-2">Certifying Authority</th>
                  <th className="border-b p-2">TAC Certificate No</th>
                  <th className="border-b p-2">COP Certificate No</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.map((d) => (
                  <tr key={d.id} className="hover:bg-muted">
                    <td className="p-2 align-top">{d.modelCode}</td>
                    <td className="p-2 align-top">{d.modelName}</td>
                    <td className="p-2 align-top">{d.certifyingAuthority}</td>
                    <td className="p-2 align-top">{d.tacCertificateNo}</td>
                    <td className="p-2 align-top">{d.copCertificateNo}</td>
                  </tr>
                ))}
                {pageSlice.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No devices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">Showing {Math.min(page * pageSize, total)} of {total}</div>
            <div className="flex items-center gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <div className="px-2">{page} / {pages}</div>
              <Button disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
