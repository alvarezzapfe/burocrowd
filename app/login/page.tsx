"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // temporal: cualquier contraseña sirve
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hint = useMemo(
    () =>
      "Mock: para usuarios normales cualquier contraseña funciona (temporal). Admin entra en /admin/login.",
    []
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // TEMPORAL:
    // - usuarios normales: cualquier contraseña funciona
    // - solo exigimos email con formato válido (input type="email" ya ayuda)
    const ok = email.trim().length > 3;

    await new Promise((r) => setTimeout(r, 250));
    setLoading(false);

    if (!ok) {
      setError("Escribe un correo válido.");
      return;
    }

    // Crea sesión client (sin customerId; si viene de handshake sí trae)
    setSession({
      role: "client",
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    });

    router.push("/onboarding");
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT: Azul + animación + logo */}
      <section className="relative overflow-hidden burocrowd-loginLeft flex items-center justify-center px-8 py-14">
        <div className="pointer-events-none absolute inset-0">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
          <span className="gridNoise" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="flex items-center gap-3">
            <img src="/crowdlink-logo.png" alt="Crowdlink" className="h-12 w-auto" />
            <div className="text-white">
              <div className="text-lg font-semibold leading-tight">burocrowdlink</div>
              <div className="text-sm text-white/75">onboarding • persona moral</div>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-semibold tracking-tight text-white">Acceso seguro</h1>
          <p className="mt-3 text-white/75 text-base leading-relaxed">
            Ingresa para comenzar el flujo de validación y carga de documentación de tu empresa.
          </p>

          <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-5">
            <div className="text-white/80 text-sm">
              • Validación de datos
              <br />• Expediente digital
              <br />• Trazabilidad y control
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: Verde + credenciales */}
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
              href="/admin/login"
              className="text-xs font-semibold text-black/70 hover:text-black transition"
              title="Acceso Admin"
            >
              Acceso Admin
            </Link>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/85 backdrop-blur-xl shadow-2xl p-8">
            <div className="text-black">
              <h2 className="text-2xl font-semibold">Iniciar sesión</h2>
              <p className="mt-1 text-black/70 text-sm">Ingresa tu correo para continuar</p>
            </div>

            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <div>
                <label className="block text-sm text-black/70 mb-2">Correo</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-2xl bg-white border border-black/10 text-black px-4 py-3 outline-none focus:border-black/30"
                  placeholder="correo@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm text-black/70 mb-2">Contraseña (temporal)</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  // si quieres que NO sea obligatoria, quita required (yo lo dejo sin required)
                  className="w-full rounded-2xl bg-white border border-black/10 text-black px-4 py-3 outline-none focus:border-black/30"
                  placeholder="cualquiera"
                />
                <div className="mt-2 text-[11px] text-black/55">
                  Por ahora: cualquier contraseña funciona. En prod esto lo reemplaza Crowdlink / handshake token.
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-black text-white font-semibold py-3 px-4 hover:opacity-95 transition disabled:opacity-60"
              >
                {loading ? "Validando..." : "Entrar"}
              </button>

              <div className="pt-2 text-xs text-black/55">{hint}</div>
            </form>

            <div className="mt-6 text-xs text-black/50">© {new Date().getFullYear()} Crowdlink</div>
          </div>
        </div>
      </section>
    </main>
  );
}
