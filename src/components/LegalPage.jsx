import { useLocation } from 'react-router-dom';

const legalContent = {
  terms: {
    title: 'Terms of Service',
    summary:
      'These Terms of Service outline how you can engage with the WagyDog protocol. By interacting with the smart contracts you acknowledge the non-custodial, decentralized nature of the dApp.',
    sections: [
      {
        heading: 'Protocol Access',
        body: 'WagyDog is a permissionless interface to decentralized liquidity and token tooling. There is no central custody, no managed accounts, and no guarantee of availability. You are fully responsible for managing wallet security and key storage.',
      },
      {
        heading: 'Smart Contract Risk',
        body: 'Interactions execute directly on blockchain smart contracts. Smart contracts may contain vulnerabilities and can fail or behave unexpectedly. Review audits, test in small amounts, and only deploy capital you can afford to lose.',
      },
      {
        heading: 'User Responsibilities',
        body: 'You must comply with local laws, perform independent diligence, and avoid using the protocol in sanctioned jurisdictions. The interface provides tooling only and does not intermediate or custody assets on your behalf.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    summary:
      'We design WagyDog with privacy in mind. As a decentralized interface we collect minimal data and never custody user funds, but on-chain interactions remain publicly visible.',
    sections: [
      {
        heading: 'Wallet & Transaction Data',
        body: 'Connecting your wallet exposes a public address. We do not custody your keys or initiate transactions on your behalf. All transactions are signed by you and recorded on-chain where they remain transparent and immutable.',
      },
      {
        heading: 'Analytics & Cookies',
        body: 'We may use privacy-respecting analytics to monitor aggregate usage. Data is anonymized, never sold, and stored with security best practices. You can opt out via your browser privacy controls at any time.',
      },
      {
        heading: 'Third-Party Integrations',
        body: 'If you follow links to explorers, dashboards, or KYC providers, their policies apply. Review their disclosures carefully and limit permissions to what is strictly necessary for your workflow.',
      },
    ],
  },
};

const LegalPage = () => {
  const { pathname } = useLocation();
  const variant = pathname.includes('privacy') ? 'privacy' : 'terms';
  const content = legalContent[variant];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-4 border-b border-slate-800 pb-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
            Legal
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">{content.title}</h1>
          <p className="max-w-2xl text-base text-slate-300">{content.summary}</p>
        </header>

        <section className="grid gap-8">
          {content.sections.map((section) => (
            <article
              key={section.heading}
              className="rounded-2xl border border-slate-900 bg-slate-900/60 p-8 shadow-xl shadow-blue-900/10 transition duration-300 hover:border-blue-600/70 hover:shadow-blue-500/20"
            >
              <h2 className="mb-3 text-2xl font-semibold text-blue-300">{section.heading}</h2>
              <p className="text-base leading-relaxed text-slate-300">{section.body}</p>
            </article>
          ))}
        </section>

        <footer className="rounded-xl border border-slate-900 bg-slate-900/80 p-6 text-sm text-slate-400">
          WagyDog is a decentralized application interface. No warranties are provided, and usage is at your own risk.
          Stay informed, keep keys safe, and interact responsibly.
        </footer>
      </div>
    </div>
  );
};

export default LegalPage;
