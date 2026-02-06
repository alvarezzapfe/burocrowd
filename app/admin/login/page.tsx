"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAdminEmail, setSession } from "@/lib/auth";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // temporal
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAdminEmail(email)) {
      setError("No autorizado. Usa tu correo admin de Crowdlink.");
      return;
    }

    // TEMPORAL: cualquier contraseña o vacío
    setSession({
      role: "admin",
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    });

    router.push("/admin/dashboard");
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="relative overflow-hidden burocrowd-loginLeft flex items-center justify-center px-8 py-14">
        <div className="pointer-events-none absolute inset-0">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
          <span className="gridNoise" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <img src="/crowdlink-logo.png" alt="Crowdlink" className="h-12 w-auto" />
          <h1 className="mt-8 text-4xl font-semibold text-white">Admin Console</h1>
          <p className="mt-3 text-white/75">
            Acceso maestro para revisar usuarios, facturación y score.
          </p>

          <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-5">
            <div className="text-white/80 text-sm">
              • Vista global de usuarios
              <br />• Export y auditoría
              <br />• Trazabilidad SAT / Buró
            </div>
          </div>
        </div>
      </section>

      <section className="burocrowd-loginRight flex items-center justify-center px-8 py-14">
        <div className="w-full max-w-md">
          {/* Top row: back to home */}
          <div className="mb-3 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-black hover:bg-white transition"
            >
              <span className="opacity-80">←</span>
              Regresar a inicio
            </Link>

            <Link
              href="/login"
              className="text-xs font-semibold text-black/70 hover:text-black transition"
              title="Login Cliente"
            >
              Login Cliente
            </Link>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-black">Login Admin</h2>
            <p className="mt-1 text-sm text-black/70">Solo correos autorizados</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-black/70 mb-2">Correo</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-2xl bg-white border border-black/10 text-black px-4 py-3 outline-none focus:border-black/30"
                  placeholder="jero@crowdlink.mx"
                />
              </div>

              <div>
                <label className="block text-sm text-black/70 mb-2">Contraseña (temporal)</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="w-full rounded-2xl bg-white border border-black/10 text-black px-4 py-3 outline-none focus:border-black/30"
                  placeholder="cualquiera"
                />
                <div className="mt-2 text-[11px] text-black/55">
                  Temporal: cualquier contraseña funciona. En prod esto se amarra a SSO/IdP.
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button className="w-full rounded-2xl bg-black text-white font-semibold py-3 px-4 hover:opacity-95 transition">
                Entrar
              </button>
            </form>

            <div className="mt-6 text-xs text-black/50">© {new Date().getFullYear()} Crowdlink</div>
          </div>
        </div>
      </section>
    </main>
  );
}
