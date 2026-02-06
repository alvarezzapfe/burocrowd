"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Dashboard Cliente (tema blanco + header azul Crowdlink)
 * - Sidebar con 3 secciones: Panel / Datos de empresa / Actividad
 * - Panel: facturación + velocímetro buró
 * - Datos de empresa: compara Capturado vs SAT (razón social + RFC)
 * - Actividad: timeline (auditoría)
 *
 * Fuente de datos (mock hoy):
 * localStorage["burocrowdlink_profile"] = {
 *   updatedAt: ISO,
 *   revenueMonthlyMXN: [{month,value}],
 *   buroScore: number,
 *   companyCaptured?: { companyName?: string; rfc?: string; },
 *   satIdentity?: { companyName?: string; rfc?: string; verifiedAt?: string; },
 *   activity?: { at: string; title: string; detail?: string }[]
 * }
 */

type RevenuePoint = { month: string; value: number };

type ActivityItem = {
  at: string; // ISO
  title: string;
  detail?: string;
};

type Profile = {
  updatedAt: string;
  revenueMonthlyMXN: RevenuePoint[];
  buroScore: number; // 100-900

  companyCaptured?: {
    companyName?: string;
    rfc?: string;
  };

  satIdentity?: {
    companyName?: string;
    rfc?: string;
    verifiedAt?: string;
  };

  activity?: ActivityItem[];
};

const FALLBACK: Profile = {
  updatedAt: new Date(0).toISOString(),
  revenueMonthlyMXN: [
    { month: "Ago", value: 0 },
    { month: "Sep", value: 0 },
    { month: "Oct", value: 0 },
    { month: "Nov", value: 0 },
    { month: "Dic", value: 0 },
    { month: "Ene", value: 0 },
  ],
  buroScore: 100,
  companyCaptured: { companyName: "—", rfc: "—" },
  satIdentity: { companyName: "—", rfc: "—" },
  activity: [],
};

type Tab = "panel" | "empresa" | "actividad";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile>(FALLBACK);
  const [tab, setTab] = useState<Tab>("panel");

  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem("burocrowdlink_profile");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Profile;
        // Si no hay activity, mete una mínima para que no se vea vacío
        const withActivity: Profile = {
          ...FALLBACK,
          ...parsed,
          companyCaptured: { ...FALLBACK.companyCaptured, ...(parsed.companyCaptured || {}) },
          satIdentity: { ...FALLBACK.satIdentity, ...(parsed.satIdentity || {}) },
          activity:
            parsed.activity && parsed.activity.length
              ? parsed.activity
              : [
                  { at: parsed.updatedAt || new Date().toISOString(), title: "Dashboard generado", detail: "Mock local" },
                ],
        };
        setProfile(withActivity);
      } catch {
        setProfile(FALLBACK);
      }
    } else {
      // Sin profile: mete timeline mínimo
      setProfile({
        ...FALLBACK,
        activity: [{ at: new Date().toISOString(), title: "Sin datos", detail: "Conecta SAT/Buró para ver resultados." }],
      });
    }
  }, []);

  const revenue = profile.revenueMonthlyMXN || [];
  const maxVal = useMemo(() => Math.max(1, ...revenue.map((r) => r.value || 0)), [revenue]);
  const avgVal = useMemo(() => {
    const sum = revenue.reduce((a, b) => a + (b.value || 0), 0);
    return Math.round(sum / Math.max(1, revenue.length));
  }, [revenue]);

  const updatedDate = useMemo(() => {
    if (!profile.updatedAt) return "—";
    const d = new Date(profile.updatedAt);
    if (Number.isNaN(d.getTime())) return "—";
    const iso = d.toISOString();
    return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
  }, [profile.updatedAt]);

  const logout = () => {
    localStorage.removeItem("burocrowdlink_profile");
    localStorage.removeItem("bcl_session");
    window.location.href = "/login";
  };

  if (!mounted) return null;

  const capturedName = profile.companyCaptured?.companyName || "—";
  const capturedRFC = profile.companyCaptured?.rfc || "—";
  const satName = profile.satIdentity?.companyName || "—";
  const satRFC = profile.satIdentity?.rfc || "—";

  const rfcMatch = normalize(capturedRFC) !== "—" && normalize(satRFC) !== "—" ? normalize(capturedRFC) === normalize(satRFC) : null;
  const nameMatch =
    normalize(capturedName) !== "—" && normalize(satName) !== "—" ? normalize(capturedName) === normalize(satName) : null;

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Topbar azul */}
      <header className="bg-[#0084FF] text-white">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/crowdlink-logo.png"
              alt="Crowdlink"
              className="h-9 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <div className="min-w-0">
              <div className="font-semibold leading-tight truncate">Dashboard</div>
              <div className="text-white/85 text-sm truncate">Actualizado: {updatedDate}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-2xl bg-white text-black font-semibold px-4 py-2.5 hover:opacity-90 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-7">
        <div className="grid lg:grid-cols-[260px_1fr] gap-5">
          {/* Sidebar (transparente y simple) */}
          <aside className="rounded-3xl border border-black/10 bg-white/60 backdrop-blur-xl p-4 h-fit">
            <div className="text-black/55 text-[11px] uppercase tracking-wider">Secciones</div>

            <nav className="mt-3 space-y-2">
              <SideBtn active={tab === "panel"} onClick={() => setTab("panel")} title="Panel" desc="Score + Facturación" />
              <SideBtn
                active={tab === "empresa"}
                onClick={() => setTab("empresa")}
                title="Datos de empresa"
                desc="Capturado vs SAT"
              />
              <SideBtn
                active={tab === "actividad"}
                onClick={() => setTab("actividad")}
                title="Actividad"
                desc="Logs / auditoría"
              />
            </nav>

            <div className="mt-5 rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-black/60 text-xs">Empresa</div>
              <div className="mt-1 font-semibold text-black truncate">{capturedName}</div>
              <div className="text-black/55 text-xs truncate">{capturedRFC}</div>
            </div>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            {/* Panel */}
            {tab === "panel" && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <StatCard label="Score Buró" value={String(profile.buroScore ?? "—")} sub="Escala 100–900" />
                  <StatCard label="Prom. facturación mensual" value={`$${avgVal.toLocaleString("es-MX")}`} sub="MXN" />
                  <StatCard label="Máx. mensual" value={`$${maxVal.toLocaleString("es-MX")}`} sub="MXN" />
                </div>

                <div className="mt-6 grid lg:grid-cols-2 gap-5">
                  <Card title="Niveles de facturación" subtitle="MXN • últimos meses (placeholder / API)">
                    <div className="mt-4 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-5">
                      <div className="flex items-end gap-3 h-44">
                        {revenue.map((p) => {
                          const h = Math.round((p.value / maxVal) * 100);
                          return (
                            <div key={p.month} className="flex-1 flex flex-col items-center gap-2">
                              <div
                                className="w-full rounded-2xl bg-[#0084FF]"
                                style={{ height: `${Math.max(6, h)}%`, transition: "height .4s ease" }}
                                title={`${p.month}: $${p.value.toLocaleString("es-MX")}`}
                              />
                              <div className="text-black/70 text-xs">{p.month}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-black/70 text-sm">
                        <span>Máx: ${maxVal.toLocaleString("es-MX")}</span>
                        <span>Prom: ${avgVal.toLocaleString("es-MX")}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-black/50">
                      Nota: aquí conectamos el pipeline e.firma/CFDI para llenar esto de verdad.
                    </div>
                  </Card>

                  <Card title="Score Buró de Crédito" subtitle="Velocímetro • 100 (malo) → 900 (bueno)">
                    <div className="mt-4 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-5">
                      <Gauge score={profile.buroScore} />

                      <div className="mt-4 flex items-center justify-between text-black/60 text-sm">
                        <span>100</span>
                        <span className="text-black font-semibold">{profile.buroScore}</span>
                        <span>900</span>
                      </div>

                      <div className="mt-3 text-[11px] text-black/50">
                        El indicador de color es visual (rojo→amarillo→verde). El score real vendrá de tu motor / buró.
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Datos de Empresa */}
            {tab === "empresa" && (
              <div className="space-y-5">
                <Card title="Datos de empresa" subtitle="Comparación: lo que capturaste vs lo que devuelve SAT">
                  <div className="mt-4 grid lg:grid-cols-2 gap-4">
                    <InfoCard
                      label="Capturado (onboarding)"
                      rows={[
                        { k: "Razón social", v: capturedName },
                        { k: "RFC", v: capturedRFC },
                      ]}
                    />
                    <InfoCard
                      label="SAT (conector)"
                      rows={[
                        { k: "Razón social", v: satName },
                        { k: "RFC", v: satRFC },
                      ]}
                    />
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <VerifyCard
                      title="Match RFC"
                      ok={rfcMatch}
                      detail={
                        rfcMatch === null
                          ? "Pendiente: conecta SAT para validar."
                          : rfcMatch
                          ? "RFC coincide."
                          : "RFC NO coincide (revisar)."
                      }
                    />
                    <VerifyCard
                      title="Match Razón social"
                      ok={nameMatch}
                      detail={
                        nameMatch === null
                          ? "Pendiente: conecta SAT para validar."
                          : nameMatch
                          ? "Razón social coincide."
                          : "Razón social NO coincide (revisar)."
                      }
                    />
                  </div>

                  <div className="mt-4 text-[11px] text-black/50">
                    En producción: aquí mostramos la “identidad fiscal” del SAT (Constancia + régimen + actividad) y el hash de verificación.
                  </div>
                </Card>

                <Card title="Acciones" subtitle="Atajos útiles (mock)">
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const next: Profile = {
                          ...profile,
                          satIdentity: {
                            companyName: capturedName === "—" ? "EMPRESA DEMO SA DE CV" : capturedName,
                            rfc: capturedRFC === "—" ? "AAAA010101AAA" : capturedRFC,
                            verifiedAt: new Date().toISOString(),
                          },
                          updatedAt: new Date().toISOString(),
                          activity: [
                            ...(profile.activity || []),
                            { at: new Date().toISOString(), title: "SAT verificado (mock)", detail: "Identidad fiscal igualada" },
                          ],
                        };
                        setProfile(next);
                        localStorage.setItem("burocrowdlink_profile", JSON.stringify(next));
                        alert("SAT (mock) actualizado ✅");
                      }}
                      className="rounded-2xl bg-black text-white font-semibold px-4 py-2.5 hover:opacity-95 transition"
                    >
                      Simular verificación SAT
                    </button>

                    <button
                      onClick={() => {
                        const next: Profile = {
                          ...profile,
                          satIdentity: { companyName: "—", rfc: "—" },
                          updatedAt: new Date().toISOString(),
                          activity: [
                            ...(profile.activity || []),
                            { at: new Date().toISOString(), title: "SAT limpiado", detail: "Se removió identidad SAT" },
                          ],
                        };
                        setProfile(next);
                        localStorage.setItem("burocrowdlink_profile", JSON.stringify(next));
                      }}
                      className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2.5 hover:bg-white transition"
                    >
                      Limpiar SAT (mock)
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {/* Actividad */}
            {tab === "actividad" && (
              <Card title="Actividad" subtitle="Eventos del expediente (auditoría / logs)">
                <div className="mt-4 rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-5">
                  <div className="space-y-3">
                    {(profile.activity || []).slice().reverse().map((a, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#0084FF]" />
                        <div className="min-w-0">
                          <div className="text-black font-semibold text-sm">{a.title}</div>
                          {a.detail && <div className="text-black/60 text-sm">{a.detail}</div>}
                          <div className="text-black/45 text-xs mt-0.5">{formatUTC(a.at)}</div>
                        </div>
                      </div>
                    ))}

                    {(!profile.activity || profile.activity.length === 0) && (
                      <div className="text-black/60 text-sm">Sin actividad aún.</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-black/50">
                  En producción: aquí va estatus de jobs SAT (RUNNING/DONE), timestamps, y quién autorizó.
                </div>
              </Card>
            )}

            {/* Footer */}
            <div className="mt-10 text-center text-xs text-black/45">
              © {new Date().getFullYear()} Crowdlink
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ---------- UI ---------- */

function SideBtn({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border px-4 py-3 transition",
        active ? "border-black/15 bg-white" : "border-black/10 bg-white/60 hover:bg-white",
      ].join(" ")}
    >
      <div className="font-semibold text-sm text-black">{title}</div>
      <div className="text-black/55 text-xs mt-0.5">{desc}</div>
    </button>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/60 backdrop-blur-xl shadow-sm p-6">
      <div className="text-black font-semibold text-lg">{title}</div>
      <div className="text-black/60 text-sm mt-1">{subtitle}</div>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/60 backdrop-blur-xl shadow-sm p-5">
      <div className="text-black/60 text-xs">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-black">{value}</div>
      <div className="mt-1 text-black/45 text-xs">{sub}</div>
    </div>
  );
}

function InfoCard({
  label,
  rows,
}: {
  label: string;
  rows: { k: string; v: string }[];
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-5">
      <div className="text-black/60 text-xs">{label}</div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-4">
            <div className="text-black/60 text-sm">{r.k}</div>
            <div className="font-semibold text-black text-sm truncate max-w-[60%] text-right">{r.v || "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifyCard({ title, ok, detail }: { title: string; ok: boolean | null; detail: string }) {
  const pill =
    ok === null
      ? "bg-black/5 border-black/10 text-black/70"
      : ok
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
      : "bg-red-500/10 border-red-500/20 text-red-700";

  const badge = ok === null ? "Pendiente" : ok ? "OK" : "Revisar";

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-black">{title}</div>
        <span className={`rounded-full border px-3 py-1 text-[11px] ${pill}`}>{badge}</span>
      </div>
      <div className="mt-2 text-black/60 text-sm">{detail}</div>
    </div>
  );
}

/* ---------- helpers ---------- */

function normalize(s: string) {
  return (s || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function formatUTC(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const x = d.toISOString();
    return `${x.slice(0, 10)} ${x.slice(11, 16)} UTC`;
  } catch {
    return "—";
  }
}

/* ---------- Gauge ---------- */

function Gauge({ score }: { score: number }) {
  const min = 100;
  const max = 900;
  const clamped = Math.max(min, Math.min(max, score));
  const t = (clamped - min) / (max - min);
  const angle = -90 + t * 180;

  return (
    <div className="w-full flex items-center justify-center">
      <svg width="320" height="190" viewBox="0 0 320 190" role="img" aria-label="Gauge score">
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,80,80,0.95)" />
            <stop offset="50%" stopColor="rgba(255,212,0,0.95)" />
            <stop offset="100%" stopColor="rgba(65,232,151,0.95)" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <path
          d="M 40 160 A 120 120 0 0 1 280 160"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 40 160 A 120 120 0 0 1 280 160"
          fill="none"
          stroke="url(#rg)"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#soft)"
        />

        {Array.from({ length: 9 }).map((_, idx) => {
          const a = (-90 + idx * 22.5) * (Math.PI / 180);
          const r1 = 105;
          const r2 = 118;
          const cx = 160;
          const cy = 160;
          const x1 = cx + r1 * Math.cos(a);
          const y1 = cy + r1 * Math.sin(a);
          const x2 = cx + r2 * Math.cos(a);
          const y2 = cy + r2 * Math.sin(a);
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(0,0,0,0.14)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        <g transform={`translate(160 160) rotate(${angle})`}>
          <line x1="0" y1="0" x2="92" y2="0" stroke="rgba(0,0,0,0.82)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="0" cy="0" r="8" fill="rgba(0,0,0,0.82)" />
          <circle cx="0" cy="0" r="14" fill="rgba(0,0,0,0.08)" />
        </g>

        <text x="160" y="182" textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="12">
          Score 100–900
        </text>
      </svg>
    </div>
  );
}
