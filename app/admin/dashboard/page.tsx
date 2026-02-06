"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearSession, getSession } from "@/lib/auth";

type UserRow = {
  id: string;
  company?: string;
  rfc?: string;
  updatedAt: string;
  buroScore?: number;
  avgMonthlyRevenue?: number;
};

const USERS_KEY = "bcl_users";

function readUsers(): UserRow[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function scoreBand(score?: number) {
  if (score == null) return "—";
  if (score < 500) return "Bajo";
  if (score < 700) return "Medio";
  return "Alto";
}

function fmtMXN(n?: number) {
  if (n == null) return "—";
  return `$${Math.round(n).toLocaleString("es-MX")}`;
}

function isoDate(d: string) {
  try {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return "—";
    return x.toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

export default function AdminDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");

  // Dropdown menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);

    const s = getSession();
    if (!s || s.role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    setUsers(readUsers());
  }, [router]);

  useEffect(() => {
    // close menu on click outside / esc
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      return (
        (u.company || "").toLowerCase().includes(term) ||
        (u.rfc || "").toLowerCase().includes(term) ||
        (u.id || "").toLowerCase().includes(term)
      );
    });
  }, [users, q]);

  const stats = useMemo(() => {
    const total = users.length;
    const withScore = users.filter((u) => typeof u.buroScore === "number").length;

    const avgScore =
      withScore > 0
        ? Math.round(
            users.reduce((a, u) => a + (typeof u.buroScore === "number" ? (u.buroScore as number) : 0), 0) / withScore
          )
        : null;

    const avgRevCount = users.filter((u) => typeof u.avgMonthlyRevenue === "number").length;
    const avgRev =
      avgRevCount > 0
        ? Math.round(
            users.reduce(
              (a, u) => a + (typeof u.avgMonthlyRevenue === "number" ? (u.avgMonthlyRevenue as number) : 0),
              0
            ) / avgRevCount
          )
        : null;

    return { total, withScore, avgScore, avgRev };
  }, [users]);

  const logout = () => {
    clearSession();
    router.push("/admin/login");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0b1220] text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/25 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/crowdlink-logo.png" alt="Crowdlink" className="h-8 w-auto" />
            <div className="min-w-0">
              <div className="font-semibold leading-tight truncate">Admin Console</div>
              <div className="text-white/60 text-xs truncate">burocrowdlink • usuarios</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por empresa, RFC o ID…"
                className="w-[360px] rounded-2xl bg-white/5 border border-white/10 text-white px-4 py-2.5 outline-none focus:border-white/25"
              />
            </div>

            {/* Hamburger menu (dropdown) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white w-11 h-11 hover:bg-white/10 transition"
                aria-label="Menu"
                title="Menu"
              >
                <Hamburger />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/12 bg-[#0b1220]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
                  >
                    <div className="font-semibold text-sm">Cerrar sesión</div>
                    <div className="text-white/60 text-xs mt-0.5">Salir del admin</div>
                  </button>

                  <div className="h-px bg-white/10" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      alert("Ayuda: aquí puedes buscar usuarios y abrir su detalle.\n\nPróximo: filtros avanzados y export.");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
                  >
                    <div className="font-semibold text-sm">Ayuda</div>
                    <div className="text-white/60 text-xs mt-0.5">Tips rápidos</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por empresa, RFC o ID…"
            className="w-full rounded-2xl bg-white/5 border border-white/10 text-white px-4 py-2.5 outline-none focus:border-white/25"
          />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Usuarios" value={String(stats.total)} />
          <KPI label="Con score" value={String(stats.withScore)} />
          <KPI label="Score promedio" value={stats.avgScore == null ? "—" : String(stats.avgScore)} />
          <KPI label="Facturación prom." value={stats.avgRev == null ? "—" : fmtMXN(stats.avgRev)} />
        </div>

        {/* Table */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold">Usuarios</div>
              <div className="text-white/60 text-sm truncate">
                Mostrando {filtered.length} de {users.length}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setUsers(readUsers())}
                className="rounded-2xl border border-white/15 bg-white/5 text-white px-4 py-2.5 hover:bg-white/10 transition"
              >
                Refrescar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-white/55">
                  <th className="text-left px-5 py-3">Empresa</th>
                  <th className="text-left px-5 py-3">RFC</th>
                  <th className="text-left px-5 py-3">Score</th>
                  <th className="text-left px-5 py-3">Facturación</th>
                  <th className="text-left px-5 py-3">Actualizado</th>
                  <th className="text-right px-5 py-3">Detalle</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-white/70" colSpan={6}>
                      No hay resultados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="border-t border-white/8 hover:bg-white/5 transition">
                      <td className="px-5 py-4 min-w-[260px]">
                        <div className="font-semibold text-white truncate">{u.company || "Empresa"}</div>
                        <div className="text-white/55 text-xs truncate">{u.id}</div>
                      </td>

                      <td className="px-5 py-4 text-white/80">{u.rfc || "—"}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{u.buroScore ?? "—"}</span>
                          <Badge text={scoreBand(u.buroScore)} />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-white/80">{fmtMXN(u.avgMonthlyRevenue)}</td>

                      <td className="px-5 py-4 text-white/70">{isoDate(u.updatedAt)}</td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/users/${encodeURIComponent(u.id)}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white px-3 py-2 text-sm hover:bg-white/10 transition"
                          title="Ver detalle"
                        >
                          <span className="mr-2 opacity-80">Ver</span>
                          <ArrowRight />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t border-white/10 text-xs text-white/55">
            Próximo: filtros por score, export a CSV, y vista de detalle con historial SAT.
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- UI bits ---------- */

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const cls =
    text === "Alto"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : text === "Medio"
      ? "border-yellow-400/20 bg-yellow-400/10 text-yellow-200"
      : text === "Bajo"
      ? "border-red-400/20 bg-red-400/10 text-red-200"
      : "border-white/15 bg-white/5 text-white/70";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${cls}`}>
      {text}
    </span>
  );
}

function Hamburger() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 5H15M3 9H15M3 13H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13 7l5 5-5 5M6 12h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
