import { useState, useMemo } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TICKETS = [
  { id: "TKT-001", title: "Projector not working in LH-01", category: "ELECTRICAL", priority: "HIGH", status: "OPEN", location: "Block A", assignee: null, createdAt: "2026-04-20", resolvedAt: null },
  { id: "TKT-002", title: "Air conditioning fault in Lab B-101", category: "HVAC", priority: "CRITICAL", status: "IN_PROGRESS", location: "Block B", assignee: "Kamal P.", createdAt: "2026-04-18", resolvedAt: null },
  { id: "TKT-003", title: "Broken chair in Meeting Room MR-3", category: "FURNITURE", priority: "LOW", status: "RESOLVED", location: "Block B", assignee: "Nimal S.", createdAt: "2026-04-15", resolvedAt: "2026-04-17" },
  { id: "TKT-004", title: "Network switch down – Floor 2", category: "NETWORK", priority: "CRITICAL", status: "OPEN", location: "Block A", assignee: null, createdAt: "2026-04-22", resolvedAt: null },
  { id: "TKT-005", title: "Whiteboard markers missing in LH-03", category: "SUPPLIES", priority: "LOW", status: "CLOSED", location: "New Block", assignee: "Saman K.", createdAt: "2026-04-10", resolvedAt: "2026-04-11" },
  { id: "TKT-006", title: "Leaking ceiling in server room", category: "STRUCTURAL", priority: "HIGH", status: "IN_PROGRESS", location: "Block C", assignee: "Kamal P.", createdAt: "2026-04-19", resolvedAt: null },
  { id: "TKT-007", title: "Smart board calibration error", category: "ELECTRICAL", priority: "MEDIUM", status: "OPEN", location: "Block A", assignee: null, createdAt: "2026-04-21", resolvedAt: null },
  { id: "TKT-008", title: "Door lock malfunction – Lab A-204", category: "SECURITY", priority: "HIGH", status: "RESOLVED", location: "Block A", assignee: "Nimal S.", createdAt: "2026-04-16", resolvedAt: "2026-04-18" },
  { id: "TKT-009", title: "Printer offline – Admin Office", category: "NETWORK", priority: "MEDIUM", status: "CLOSED", location: "Admin Wing", assignee: "Saman K.", createdAt: "2026-04-12", resolvedAt: "2026-04-13" },
  { id: "TKT-010", title: "Fire extinguisher inspection due", category: "SAFETY", priority: "CRITICAL", status: "OPEN", location: "All Blocks", assignee: null, createdAt: "2026-04-23", resolvedAt: null },
];

const PRIORITY_CONFIG = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500", bar: "bg-red-500" },
  HIGH:     { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-500", bar: "bg-orange-500" },
  MEDIUM:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-400", bar: "bg-yellow-400" },
  LOW:      { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-500", bar: "bg-slate-500" },
};

const STATUS_CONFIG = {
  OPEN:        { label: "Open",        color: "text-sky-400",     bg: "bg-sky-500/15",     border: "border-sky-500/30" },
  IN_PROGRESS: { label: "In Progress", color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30" },
  RESOLVED:    { label: "Resolved",    color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  CLOSED:      { label: "Closed",      color: "text-slate-400",   bg: "bg-slate-500/15",   border: "border-slate-600/30" },
};

const CATEGORY_ICONS = {
  ELECTRICAL: "⚡", HVAC: "❄️", FURNITURE: "🪑", NETWORK: "🌐",
  SUPPLIES: "📦", STRUCTURAL: "🏗️", SECURITY: "🔒", SAFETY: "🧯",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, highlight, pulse }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 ${highlight ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600" : "bg-slate-900/80 border-slate-700/50"}`}>
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shadow-inner">
          {icon}
        </div>
        {pulse && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </span>
        )}
      </div>
      <div className="text-4xl font-black text-white tracking-tight mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-300">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-300 w-6 text-right">{value}</span>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function TicketDashboard({ tickets = MOCK_TICKETS, onViewAll, onCreateTicket }) {
  const [activeStatus, setActiveStatus] = useState(null);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "OPEN").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS").length;
    const resolved = tickets.filter(t => t.status === "RESOLVED").length;
    const closed = tickets.filter(t => t.status === "CLOSED").length;
    const critical = tickets.filter(t => t.priority === "CRITICAL").length;
    const unassigned = tickets.filter(t => !t.assignee && t.status === "OPEN").length;
    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

    const byPriority = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => ({
      label: p,
      value: tickets.filter(t => t.priority === p).length,
    }));

    const byCategory = Object.entries(
      tickets.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const byTechnician = Object.entries(
      tickets.filter(t => t.assignee).reduce((acc, t) => { acc[t.assignee] = (acc[t.assignee] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]);

    return { total, open, inProgress, resolved, closed, critical, unassigned, resolutionRate, byPriority, byCategory, byTechnician };
  }, [tickets]);

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const filteredByStatus = activeStatus
    ? tickets.filter(t => t.status === activeStatus)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold tracking-[0.2em] text-teal-500 uppercase">Module C</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-500">Smart Campus Operations Hub</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Maintenance Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Incident & Ticket Operations — Real-time Overview</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onViewAll}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition-all"
            >
              All Tickets
            </button>
            <button
              onClick={onCreateTicket}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </button>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard icon="🎫" label="Total Tickets" value={stats.total} sub="All time" highlight />
          <KpiCard icon="🔓" label="Open" value={stats.open} sub={`${stats.unassigned} unassigned`} pulse={stats.open > 0} />
          <KpiCard icon="⚙️" label="In Progress" value={stats.inProgress} sub="Being handled" />
          <KpiCard icon="✅" label="Resolution Rate" value={`${stats.resolutionRate}%`} sub={`${stats.resolved + stats.closed} resolved / closed`} />
        </div>

        {/* ── Alert Banner for Critical ── */}
        {stats.critical > 0 && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-3.5 mb-6">
            <span className="text-xl animate-bounce">🚨</span>
            <div className="flex-1">
              <span className="text-sm font-bold text-red-400">{stats.critical} Critical ticket{stats.critical > 1 ? "s" : ""} require immediate attention</span>
              <span className="text-xs text-red-400/60 ml-2">— escalate to facility manager</span>
            </div>
            <button onClick={() => onViewAll?.("CRITICAL")} className="text-xs font-bold text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
              View →
            </button>
          </div>
        )}

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Status Breakdown — clickable */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Status Breakdown</h2>
            <div className="space-y-3">
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => {
                const cfg = STATUS_CONFIG[s];
                const count = tickets.filter(t => t.status === s).length;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const isActive = activeStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setActiveStatus(isActive ? null : s)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isActive ? `${cfg.bg} ${cfg.border}` : "border-transparent hover:bg-slate-800/60"}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      s === "OPEN" ? "bg-sky-500" : s === "IN_PROGRESS" ? "bg-amber-500" : s === "RESOLVED" ? "bg-emerald-500" : "bg-slate-500"
                    } ${isActive ? "shadow-lg" : ""}`} />
                    <span className={`flex-1 text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{count}</span>
                    <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
                  </button>
                );
              })}
            </div>
            {activeStatus && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Filtered: {STATUS_CONFIG[activeStatus].label}</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredByStatus.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-mono">{t.id}</span>
                      <span className="text-slate-300 truncate flex-1">{t.title}</span>
                      <span className={`font-bold ${PRIORITY_CONFIG[t.priority].color}`}>{t.priority[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Priority Distribution</h2>
            <div className="space-y-4 mb-6">
              {stats.byPriority.map(({ label, value }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[label].dot}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${PRIORITY_CONFIG[label].color}`}>{label}</span>
                    </div>
                    <span className="text-sm font-black text-white">{value}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${PRIORITY_CONFIG[label].bar}`}
                      style={{ width: `${stats.total > 0 ? (value / stats.total) * 100 : 0}%`, transition: "width 1s ease" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Visual gauge circle for resolution rate */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="#14b8a6" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(stats.resolutionRate / 100) * 94.2} 94.2`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-teal-400">
                  {stats.resolutionRate}%
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">Resolution Rate</p>
                <p className="text-xs text-slate-400">{stats.resolved + stats.closed} of {stats.total} tickets closed out</p>
              </div>
            </div>
          </div>

          {/* Top Categories + Technicians */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Top Categories</h2>
            <div className="space-y-2.5 mb-5">
              {stats.byCategory.map(([cat, count]) => (
                <MiniBar
                  key={cat}
                  label={`${CATEGORY_ICONS[cat] || "🔧"} ${cat}`}
                  value={count}
                  max={stats.total}
                  color="bg-teal-500"
                />
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Technician Workload</h3>
              {stats.byTechnician.length === 0 ? (
                <p className="text-xs text-slate-600">No assignments yet</p>
              ) : (
                <div className="space-y-2.5">
                  {stats.byTechnician.map(([name, count]) => (
                    <MiniBar
                      key={name}
                      label={name}
                      value={count}
                      max={Math.max(...stats.byTechnician.map(([, c]) => c))}
                      color="bg-violet-500"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Recent Tickets ── */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Tickets</h2>
            <button onClick={onViewAll} className="text-sm text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  {["ID", "Title", "Category", "Priority", "Status", "Assignee", "Date"].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => {
                  const pri = PRIORITY_CONFIG[t.priority];
                  const sts = STATUS_CONFIG[t.status];
                  return (
                    <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">{t.id}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-slate-200 font-medium text-xs leading-snug line-clamp-1 max-w-[180px] block">{t.title}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-slate-400">{CATEGORY_ICONS[t.category]} {t.category}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${pri.bg} ${pri.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pri.dot}`} />
                          {t.priority}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full border text-xs font-semibold ${sts.bg} ${sts.border} ${sts.color}`}>
                          {sts.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {t.assignee
                          ? <span className="text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg">{t.assignee}</span>
                          : <span className="text-xs text-slate-600 italic">Unassigned</span>
                        }
                      </td>
                      <td className="py-3 text-xs text-slate-500">{t.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}