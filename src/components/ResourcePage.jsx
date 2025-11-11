const ResourcePage = ({ title, description }) => (
  <div className="min-h-screen bg-slate-950 py-16 px-4 text-slate-100">
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 rounded-3xl border border-slate-900 bg-slate-900/60 p-12 text-center shadow-2xl shadow-emerald-900/10">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
        <svg
          className="h-12 w-12"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="40" height="28" rx="4" className="fill-slate-900 stroke-emerald-400" />
          <path
            d="M14 30L20 24L26 28L34 20"
            className="stroke-emerald-300"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 18H44" className="stroke-blue-500" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-4">
        <p className="inline-flex items-center rounded-full bg-slate-900/80 px-4 py-1 text-xs uppercase tracking-[0.3em] text-blue-400">
          Resource
        </p>
        <h1 className="text-4xl font-semibold text-slate-50 sm:text-5xl">{title}</h1>
        <p className="text-base text-slate-300">{description}</p>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-emerald-300">Content coming soon</p>
        <p className="text-sm text-slate-400">
          Our team is curating compliant, transparent materials that reflect the decentralized foundations of the WagyDog
          ecosystem. Check back shortly for the latest updates.
        </p>
      </div>
    </div>
  </div>
);

export default ResourcePage;
