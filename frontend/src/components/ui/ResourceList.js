import { useState, useMemo } from "react";

const MOCK_RESOURCES = [
  { id: 1, name: "Lab A-204", type: "LAB", capacity: 30, location: "Block A, Floor 2", status: "ACTIVE", availableFrom: "08:00", availableTo: "18:00" },
  { id: 2, name: "Lecture Hall LH-01", type: "LECTURE_HALL", capacity: 120, location: "Main Block, Ground Floor", status: "ACTIVE", availableFrom: "07:30", availableTo: "20:00" },
  { id: 3, name: "Meeting Room MR-3", type: "MEETING_ROOM", capacity: 10, location: "Block B, Floor 1", status: "ACTIVE", availableFrom: "09:00", availableTo: "17:00" },
  { id: 4, name: "Projector #7", type: "EQUIPMENT", capacity: null, location: "AV Store, Block C", status: "OUT_OF_SERVICE", availableFrom: null, availableTo: null },
  { id: 5, name: "Lab B-101", type: "LAB", capacity: 40, location: "Block B, Ground Floor", status: "MAINTENANCE", availableFrom: "08:00", availableTo: "18:00" },
  { id: 6, name: "Camera Kit #2", type: "EQUIPMENT", capacity: null, location: "Media Lab", status: "ACTIVE", availableFrom: "09:00", availableTo: "16:00" },
  { id: 7, name: "Lecture Hall LH-03", type: "LECTURE_HALL", capacity: 80, location: "New Block, Floor 1", status: "ACTIVE", availableFrom: "07:30", availableTo: "20:00" },
  { id: 8, name: "Meeting Room MR-7", type: "MEETING_ROOM", capacity: 20, location: "Block A, Floor 3", status: "OUT_OF_SERVICE", availableFrom: "09:00", availableTo: "17:00" },
];

const TYPE_FILTERS = ["ALL", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUS_COLORS = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  OUT_OF_SERVICE: "bg-red-100 text-red-600",
  MAINTENANCE: "bg-amber-100 text-amber-700",
};
const TYPE_ICONS = { LECTURE_HALL: "🎓", LAB: "🔬", MEETING_ROOM: "🤝", EQUIPMENT: "📷" };

export default function ResourceList({ onView, onEdit, onAdd, resources = MOCK_RESOURCES }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    return resources
      .filter((r) => {
        const matchSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.location.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "ALL" || r.type === typeFilter;
        const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        let av = a[sortField] ?? "";
        let bv = b[sortField] ?? "";
        if (typeof av === "string") av = av.toLowerCase();
        if (typeof bv === "string") bv = bv.toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [resources, search, typeFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => (
    <span className={`ml-1 text-xs ${sortField === field ? "text-teal-600" : "text-slate-300"}`}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Facilities & Assets</h1>
            <p className="text-slate-500 text-sm mt-0.5">{filtered.length} resources found</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Resource
          </button>
        </div>

        {/* Filters bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7 7 0 1010 17a7 7 0 006.65-4.35z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-teal-400 bg-white"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t} value={t}>{t === "ALL" ? "All Types" : t.replace("_", " ")}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 outline-none focus:border-teal-400 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {/* View toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {["table", "grid"].map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`p-1.5 rounded-lg transition-all ${viewMode === m ? "bg-white shadow-sm text-teal-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                {m === "table" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[["name", "Name"], ["type", "Type"], ["capacity", "Capacity"], ["location", "Location"], ["status", "Status"]].map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => toggleSort(field)}
                      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                    >
                      {label}<SortIcon field={field} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🔍</span>
                        <p className="text-sm">No resources match your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{TYPE_ICONS[r.type]}</span>
                          <span className="font-medium text-slate-800">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.type.replace("_", " ")}</td>
                      <td className="px-4 py-3 text-slate-600">{r.capacity ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{r.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => onView?.(r)} className="text-slate-400 hover:text-teal-600 transition-colors p-1 rounded-lg hover:bg-teal-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button onClick={() => onEdit?.(r)} className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-lg hover:bg-blue-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-400">
                <span className="text-3xl block mb-2">🔍</span>
                <p className="text-sm">No resources match your filters</p>
              </div>
            ) : (
              filtered.map((r) => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{TYPE_ICONS[r.type]}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{r.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{r.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      {r.capacity ? `👥 ${r.capacity}` : ""}
                      {r.availableFrom ? ` · ${r.availableFrom}–${r.availableTo}` : ""}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onView?.(r)} className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button onClick={() => onEdit?.(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}