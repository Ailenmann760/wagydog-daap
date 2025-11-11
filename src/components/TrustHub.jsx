import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Newspaper, ClipboardList, BadgeCheck } from 'lucide-react';

const trustResources = [
  {
    title: 'Audit Report',
    description: 'Dive into the latest smart contract and protocol audit summaries that power platform resilience.',
    href: '/resources/audit',
    icon: ShieldCheck,
  },
  {
    title: 'Press & Media Kit',
    description: 'Access brand assets, executive bios, and media-ready story angles for WagyDog coverage.',
    href: '/resources/press',
    icon: Newspaper,
  },
  {
    title: 'Terms of Service',
    description: 'Understand your rights, platform expectations, and the responsible use guidelines we uphold.',
    href: '/legal/terms',
    icon: FileText,
  },
  {
    title: 'Privacy Policy',
    description: 'Review how we steward data, protect identities, and maintain confidentiality across the stack.',
    href: '/legal/privacy',
    icon: ClipboardList,
  },
];

const TrustHub = () => {
  return (
    <div className="min-h-screen bg-slate-950/30 py-16 px-6 md:px-10 lg:px-16 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-16">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/40">
            <BadgeCheck className="h-4 w-4" />
            Trust Hub
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Compliance, clarity, and confidence for every participant
          </h1>
          <p className="max-w-3xl text-lg text-slate-300">
            WagyDog is built on transparent guardrails and auditable systems. Explore the resources, attestations, and
            policy commitments that underpin a trustworthy launch.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {trustResources.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              to={href}
              className="group relative flex flex-col gap-4 rounded-2xl bg-slate-900/70 p-6 shadow-[0_25px_60px_-35px_rgba(15,115,255,0.45)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(16,185,129,0.55)]"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-500/20 p-3 ring-1 ring-blue-400/30 transition group-hover:bg-emerald-500/20 group-hover:ring-emerald-400/30">
                  <Icon className="h-6 w-6 text-blue-300 transition group-hover:text-emerald-300" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-widest text-blue-300 transition group-hover:text-emerald-300">
                  View
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 shadow-[0_45px_120px_-60px_rgba(15,115,255,0.35)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-50">Regulatory Compliance Status</h2>
              <p className="max-w-3xl text-base leading-relaxed text-slate-300">
                WagyDog maintains active alignment with emerging Web3 regulatory frameworks. Our legal and compliance
                partners are engaged in ongoing jurisdictional reviews, Know Your Customer (KYC) readiness assessments,
                and smart contract audit cycles to ensure launch integrity.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-emerald-500/10 p-5 text-emerald-200 ring-1 ring-emerald-400/30">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
                Status
              </div>
              <p className="text-lg font-medium text-emerald-200">Launch-ready compliance in motion</p>
              <p className="text-sm text-emerald-100/90">
                Next formal update scheduled post regulatory diligence wrap-up. Subscribe to alerts to stay current.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-blue-100">
          <h3 className="text-xl font-semibold text-blue-100">Continuous Transparency</h3>
          <p className="mt-2 text-sm text-blue-200/80">
            We publish audit addendums, validator transparency reports, and community governance updates on a rolling
            cadence. Bookmark this hub to follow each release as we march toward mainnet launch.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TrustHub;
