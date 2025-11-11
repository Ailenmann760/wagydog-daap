import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Mail, MessageCircle } from 'lucide-react';

const SupportPage = () => {
  const [formState, setFormState] = useState({ email: '', message: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Support form submission attempted:', formState);
  };

  return (
    <div className="min-h-screen bg-slate-950/30 py-16 px-6 md:px-10 lg:px-16 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header className="space-y-4 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-blue-300 ring-1 ring-blue-400/40">
            <LifeBuoy className="h-4 w-4" />
            Support Desk
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            We&apos;re here to help keep your launch momentum
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300 md:mx-0">
            Tap into rapid answers, connect with the core team, and share context-rich feedback so every WagyDog release
            launches smoother than the last.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-8 shadow-[0_30px_80px_-50px_rgba(59,130,246,0.45)]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-50">Contact Form</h2>
              <p className="mt-2 text-sm text-slate-300">
                Send us the quick details now so our support engineers can respond with clarity.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-blue-200">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="you@company.xyz"
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Message</span>
                <textarea
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="How can we help move you forward?"
                  className="w-full resize-none rounded-xl border border-slate-700/70 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                  required
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-[0_20px_45px_-30px_rgba(14,165,233,0.9)] transition hover:scale-[1.01]"
              >
                Submit Assistance Request
              </button>
            </form>
          </div>

          <aside className="flex flex-col gap-6 rounded-3xl border border-blue-500/20 bg-blue-500/10 p-8 text-blue-100">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-blue-50">FAQs & Knowledge Base</h2>
              <p className="text-sm text-blue-100/80">
                We publish answers to high-frequency questions, integration checklists, and governance updates.
              </p>
              <Link
                to="/support/knowledge-base"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-200 transition hover:text-emerald-100"
              >
                Explore articles →
              </Link>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-950/40 p-5 ring-1 ring-blue-400/30">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-blue-200">
                <Mail className="h-4 w-4" />
                Direct Email
              </div>
              <a
                href="mailto:corporateblackclaw@gmail.com"
                className="text-base font-medium text-slate-50 transition hover:text-emerald-200"
              >
                corporateblackclaw@gmail.com
              </a>
              <p className="text-xs text-slate-400">Target response time: under 12 hours.</p>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-950/40 p-5 ring-1 ring-emerald-400/30">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-emerald-200">
                <MessageCircle className="h-4 w-4" />
                Discord War Room
              </div>
              <a
                href="https://discord.gg/wagydog"
                target="_blank"
                rel="noreferrer"
                className="text-base font-medium text-slate-50 transition hover:text-blue-200"
              >
                Join real-time support
              </a>
              <p className="text-xs text-slate-400">
                Priority updates, community troubleshooting, and launch cadence alerts.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
