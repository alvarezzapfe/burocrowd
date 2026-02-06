"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StepId = "empresa" | "documentos" | "buro_sat";
type Step = { id: StepId; title: string; subtitle: string };

type RevenuePoint = { month: string; value: number };
type Profile = {
  updatedAt: string;
  revenueMonthlyMXN: RevenuePoint[];
  buroScore: number; // 100-900
};

export default function OnboardingPage() {
  const router = useRouter();

  const steps: Step[] = useMemo(
    () => [
      { id: "empresa", title: "Empresa", subtitle: "Datos generales y fiscales básicos" },
      { id: "documentos", title: "Documentos", subtitle: "Carga del expediente" },
      { id: "buro_sat", title: "Buró / SAT", subtitle: "Conexión SAT (CIEC) + nivel de facturación" },
    ],
    []
  );

  const [i, setI] = useState(0);
  const step = steps[i];
  const pct = Math.round(((i + 1) / steps.length) * 100);

  const go = (next: number) => setI(Math.max(0, Math.min(steps.length - 1, next)));

  const onNext = () => {
    if (i === steps.length - 1) {
      router.push("/dashboard");
      return;
    }
    go(i + 1);
  };

  const onBack = () => go(i - 1);

  return (
    <main className="min-h-screen burocrowd-bg px-4 md:px-6 py-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Top */}
          <header className="px-5 md:px-8 py-5 md:py-6 border-b border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img src="/crowdlink-logo.png" alt="Crowdlink" className="h-9 w-auto" />
                <div className="min-w-0">
                  <div className="text-white font-semibold leading-tight truncate">burocrowdlink</div>
                  <div className="text-white/65 text-sm truncate">Onboarding persona moral</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white/75 text-[11px]">Progreso</div>
                <div className="text-white font-semibold text-sm">{pct}%</div>
              </div>
            </div>

            <div className="mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/80 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </header>

          {/* Body */}
          <div className="grid lg:grid-cols-[300px_1fr]">
            {/* Rail */}
            <aside className="px-5 md:px-8 py-5 md:py-6 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="text-white/70 text-[11px] uppercase tracking-wider">Secciones</div>

              <div className="mt-3 space-y-2">
                {steps.map((s, idx) => {
                  const active = idx === i;
                  const done = idx < i;

                  return (
                    <button
                      key={s.id}
                      onClick={() => go(idx)}
                      className={[
                        "w-full text-left rounded-2xl px-4 py-3 border transition",
                        active ? "border-white/25 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/8",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={[
                            "h-2.5 w-2.5 rounded-full",
                            done ? "bg-white/80" : active ? "bg-white/70" : "bg-white/30",
                          ].join(" ")}
                        />
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-sm truncate">{s.title}</div>
                          <div className="text-white/60 text-xs truncate">{s.subtitle}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-white/55 text-xs">
                Box fijo: el contenido no expande, se scrollea dentro si hace falta.
              </div>
            </aside>

            {/* Content */}
            <section className="px-5 md:px-8 py-5 md:py-6">
              <div className="rounded-3xl border border-white/12 bg-black/20 p-5 md:p-6">
                {/* FIXED SIZE WRAPPER (always same size) */}
                <div className="buro-fixedCardCompact">
                  <div className="buro-stepAnim h-full burocrowd-innerScroll">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-white">{step.title}</h1>
                        <p className="mt-1 text-white/70 text-sm">{step.subtitle}</p>
                      </div>
                      <div className="text-white/60 text-xs pt-1">
                        {i + 1} / {steps.length}
                      </div>
                    </div>

                    <div className="mt-5">
                      {step.id === "empresa" && <EmpresaCompact />}
                      {step.id === "documentos" && <DocumentosCompact />}
                      {step.id === "buro_sat" && <BuroSatCompact />}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    onClick={onBack}
                    disabled={i === 0}
                    className="rounded-2xl border border-white/15 bg-white/5 text-white px-4 py-2.5 disabled:opacity-40"
                  >
                    Atrás
                  </button>

                  <button
                    onClick={onNext}
                    className="rounded-2xl bg-white text-black font-semibold px-5 py-2.5 hover:opacity-90 transition"
                  >
                    {i === steps.length - 1 ? "Finalizar y ver dashboard" : "Continuar"}
                  </button>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-white/50">
                © {new Date().getFullYear()} Crowdlink
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] text-white/70 mb-1.5">{label}</label>
      <input
        type={type}
        className="w-full rounded-2xl bg-black/35 border border-white/15 text-white px-4 py-2.5 outline-none focus:border-white/35"
        placeholder={placeholder}
      />
    </div>
  );
}

/* ---------- Steps ---------- */

function EmpresaCompact() {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <Field label="Razón social" placeholder="Ej. PorCuanto S.A. de C.V." />
      <Field label="RFC" placeholder="AAAA010101AAA" />
      <Field label="Giro / Actividad" placeholder="Ej. Servicios financieros" />
      <Field label="Fecha de constitución" placeholder="YYYY-MM-DD" type="date" />
      <Field label="Correo" placeholder="contacto@empresa.com" type="email" />
      <Field label="Teléfono" placeholder="+52 55 ..." />
      <Field label="Domicilio" placeholder="Calle, número, colonia, ciudad" />
      <Field label="CLABE" placeholder="18 dígitos" />
    </div>
  );
}

function DocumentosCompact() {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      <DocMini title="Acta constitutiva" desc="PDF" />
      <DocMini title="Constancia fiscal" desc="PDF" />
      <DocMini title="Estados financieros" desc="PDF/Excel" />
      <DocMini title="Identificación (apoderado)" desc="PDF/JPG" />
    </div>
  );
}

function DocMini({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-semibold text-sm truncate">{title}</div>
          <div className="text-white/60 text-xs mt-0.5">{desc}</div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-2xl bg-white text-black font-semibold px-3 py-2 text-sm hover:opacity-90 transition"
        >
          Subir
        </button>
      </div>
    </div>
  );
}

function BuroSatCompact() {
  const saveMockResult = () => {
    const payload: Profile = {
      updatedAt: new Date().toISOString(),
      revenueMonthlyMXN: [
        { month: "Ago", value: 420000 },
        { month: "Sep", value: 510000 },
        { month: "Oct", value: 480000 },
        { month: "Nov", value: 610000 },
        { month: "Dic", value: 740000 },
        { month: "Ene", value: 690000 },
      ],
      buroScore: 742,
    };

    localStorage.setItem("burocrowdlink_profile", JSON.stringify(payload));
    alert("Mock guardado ✅ Ahora puedes finalizar y ver el dashboard.");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-white/12 bg-white/5 p-5">
        <div className="text-white font-semibold">Conectar a SAT (CIEC)</div>
        <div className="text-white/65 text-xs mt-1">
          Paso final. Aquí va la integración del API para estimar facturación (tu equipo lo conecta).
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <Field label="RFC" placeholder="AAAA010101AAA" />
          <Field label="CIEC (Contraseña)" placeholder="••••••••" type="password" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveMockResult}
            className="rounded-2xl bg-white text-black font-semibold px-4 py-2.5 hover:opacity-90 transition"
          >
            Conectar y escanear (mock)
          </button>

          <button
            type="button"
            onClick={() => localStorage.removeItem("burocrowdlink_profile")}
            className="rounded-2xl border border-white/15 bg-white/5 text-white px-4 py-2.5 hover:bg-white/10 transition"
          >
            Limpiar mock
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/12 bg-black/20 p-5">
        <div className="text-white font-semibold">Resultado (placeholder)</div>
        <div className="mt-1 text-white/70 text-sm">
          Guarda el mock y luego presiona <span className="text-white font-semibold">Finalizar</span>.
        </div>
      </div>
    </div>
  );
}
