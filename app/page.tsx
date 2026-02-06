import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen burocrowd-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        <div className="flex items-center justify-center mb-6">
          <img src="/crowdlink-logo.png" alt="Crowdlink" className="h-14 w-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-white text-center">burocrowdlink</h1>
        <p className="mt-2 text-center text-white/75">Onboarding para personas morales</p>

        <div className="mt-8 space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center rounded-2xl bg-white text-black font-semibold py-3 px-4 hover:opacity-90 transition"
          >
            Iniciar
          </Link>

          <Link
            href="/admin/login"
            className="w-full inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-white font-semibold py-3 px-4 hover:bg-white/10 transition"
          >
            Acceso Admin
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Crowdlink
        </p>
      </div>
    </main>
  );
}
