import { useMemo, useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useNavigate } from "react-router-dom";
import { manufacturerApi, type InventoryItem } from "@/api";

export default function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await manufacturerApi.getInventory();
      setDevices(response.data || []);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return devices.filter((d) => {
      if (filter === "assigned" && (!d.distributor_entity_id && !d.rfc_entity_id)) return false;
      if (filter === "unassigned" && (d.distributor_entity_id || d.rfc_entity_id)) return false;
      if (!q) return true;
      return [
        d.imei,
        d.serial_number,
        d.VLTD_model_code,
        d.certificate_number,
        d.distributor_entity?.name,
        d.rfc_entity?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, filter, devices]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const headers = ["IMEI", "Serial Number", "Model Code", "Certificate", "Distributor", "RFC", "Created Date"];
    const rows = [
      headers.join(","),
      ...filtered.map((d) =>
        [
          d.imei,
          d.serial_number,
          d.VLTD_model_code,
          d.certificate_number,
          d.distributor_entity?.name || d.distributor_entity_id || "-",
          d.rfc_entity?.name || d.rfc_entity_id || "-",
          new Date(d.createdAt).toLocaleDateString()
        ].map(v => `"${v}"`).join(",")
      )
    ];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Device Inventory</h2>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/manufacturer/add-device")}>Add Device</Button>
          <Button variant="ghost" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Top filters */}
      <div className="flex gap-2 items-center mb-4">
        <Button
          variant={filter === "all" ? undefined : "ghost"}
          onClick={() => { setFilter("all"); setPage(1); }}
        >
          All Devices ({devices.length})
        </Button>
        <Button
          variant={filter === "assigned" ? undefined : "ghost"}
          onClick={() => { setFilter("assigned"); setPage(1); }}
        >
          Assigned ({devices.filter((s) => s.distributor_entity_id || s.rfc_entity_id).length})
        </Button>
        <Button
          variant={filter === "unassigned" ? undefined : "ghost"}
          onClick={() => { setFilter("unassigned"); setPage(1); }}
        >
          Unassigned ({devices.filter((s) => !s.distributor_entity_id && !s.rfc_entity_id).length})
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-3 py-1"
                placeholder="Search IMEI, serial, model, distributor or RFC"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">Total: {total}</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm font-semibold bg-gray-50">
                  <th className="border-b p-2">IMEI</th>
                  <th className="border-b p-2">Serial Number</th>
                  <th className="border-b p-2">Model Code</th>
                  <th className="border-b p-2">Certificate</th>
                  <th className="border-b p-2">Distributor</th>
                  <th className="border-b p-2">RFC</th>
                  <th className="border-b p-2">Status</th>
                  <th className="border-b p-2">Created Date</th>
                  <th className="border-b p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 text-sm">
                    <td className="p-2 align-top font-mono font-medium text-blue-600">
                      <button
                        onClick={() => navigate(`/manufacturer/inventory/${d.id}`, { state: { device: d } })}
                        className="hover:underline"
                      >
                        {d.imei}
                      </button>
                    </td>
                    <td className="p-2 align-top font-mono">{d.serial_number}</td>
                    <td className="p-2 align-top">
                      <Badge variant="outline">{d.VLTD_model_code}</Badge>
                    </td>
                    <td className="p-2 align-top font-mono text-xs">{d.certificate_number}</td>
                    <td className="p-2 align-top">
                      {d.distributor_entity ? (
                        <span className="text-green-700 font-medium">
                          {d.distributor_entity.name || "Unnamed"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2 align-top">
                      {d.rfc_entity ? (
                        <span className="text-purple-700 font-medium">
                          {d.rfc_entity.name || "Unnamed"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-2 align-top">
                      {d.distributor_entity_id || d.rfc_entity_id ? (
                        <Badge className="bg-green-100 text-green-800 border-green-300">Assigned</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">Unassigned</Badge>
                      )}
                    </td>
                    <td className="p-2 align-top text-xs">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 align-top">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/manufacturer/inventory/${d.id}`, { state: { device: d } })}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {pageSlice.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-muted-foreground">
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
