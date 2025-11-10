const navItems = {
  brand: {
    name: 'WagyDog',
    label: 'WagyDog Protocol',
    description: 'Institutional-grade memecoin infrastructure on BNB Chain.',
  },
  items: [
    {
      title: 'dApp',
      description: 'Trade, stake, and farm with enterprise-grade execution.',
      icon: 'terminal',
      links: [
        { label: 'Swap Token', href: '/swap' },
        { label: 'Staking', href: '/pools?tab=staking' },
        { label: 'Farming', href: '/pools?tab=farming' },
      ],
    },
    {
      title: 'Ecosystem',
      description: 'Discover the WAGY economic engine and growth roadmap.',
      icon: 'lineChart',
      links: [
        { label: 'Tokenomics', href: '/marketplace#tokenomics' },
        { label: 'Roadmap', href: '/#roadmap' },
        { label: 'Audit', href: '/resources/audit' },
      ],
    },
    {
      title: 'Community',
      description: 'Stay connected with governance and real-time updates.',
      icon: 'users',
      links: [
        { label: 'Twitter / X', href: 'https://twitter.com', external: true },
        { label: 'Telegram', href: 'https://telegram.org', external: true },
        { label: 'Discord', href: 'https://discord.com', external: true },
      ],
    },
  ],
  cta: {
    label: 'Launch dApp',
    href: '/swap',
    buttonBgColor: '#7c5cff',
    buttonTextColor: '#ffffff',
  },
};

export default navItems;
