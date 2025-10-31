import { useMemo, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

type UserRow = {
  id: string;
  fullName: string;
  userName: string;
  designation: string;
  email: string;
  contactNo: string;
  editable?: boolean;
};

const SAMPLE_USERS: UserRow[] = [
  {
    id: "u1",
    fullName: "BAZEER AHAMED",
    userName: "vltdapmgroup",
    designation: "Admin",
    email: "bazeer@apmgroup.ltd",
    contactNo: "9655543732",
    editable: false,
  },
];

export default function ManufacturerUsers() {
  const [query, setQuery] = useState("");
  const [page] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_USERS;
    return SAMPLE_USERS.filter((u) =>
      [u.fullName, u.userName, u.designation, u.email, u.contactNo].join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageSlice = filtered.slice((page - 1) * pageSize, page * pageSize);

  function exportCSV() {
    const headers = ["Full Name", "User Name", "Designation", "Email ID", "Contact No"];
    const rows = [headers.join(","), ...filtered.map((r) => [r.fullName, r.userName, r.designation, r.email, r.contactNo].join(","))];
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">All Users</h2>
          <div className="text-sm text-muted-foreground">Total Count: {SAMPLE_USERS.length}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost">Manage Roles</Button>
          <Button onClick={() => alert("Add User flow — implement form")}>Add User</Button>
          <Button variant="ghost" onClick={exportCSV}>CSV</Button>
          <Button variant="ghost" onClick={() => alert("Excel export not implemented")}>Excel</Button>
          <Button variant="ghost" onClick={() => window.print()}>PDF</Button>
        </div>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <input
              placeholder="Search"
              className="border rounded px-3 py-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="border-b p-2">Full Name</th>
                  <th className="border-b p-2">User Name</th>
                  <th className="border-b p-2">Designation</th>
                  <th className="border-b p-2">Email ID</th>
                  <th className="border-b p-2">Contact No</th>
                  <th className="border-b p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.map((u) => (
                  <tr key={u.id} className="hover:bg-muted">
                    <td className="p-2 align-top">{u.fullName}</td>
                    <td className="p-2 align-top">{u.userName}</td>
                    <td className="p-2 align-top">{u.designation}</td>
                    <td className="p-2 align-top">{u.email}</td>
                    <td className="p-2 align-top">{u.contactNo}</td>
                    <td className="p-2 align-top">{u.editable ? <Button size="sm">Edit</Button> : <span>No Editable</span>}</td>
                  </tr>
                ))}
                {pageSlice.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">show {Math.min(pageSize, total)}</div>
            <div className="flex items-center gap-2">
              <div className="text-sm">page {page} of {pages}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
