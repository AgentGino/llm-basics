import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'LLM Basics',
  tagline: 'A deliberate path from first principles to production systems.',
  favicon: 'img/favicon.ico',
  future: {v4: true},
  url: 'https://llm-learning.inprogress.fyi',
  baseUrl: '/',
  organizationName: 'AgentGino',
  projectName: 'llm-basics',
  onBrokenLinks: 'throw',
  i18n: {defaultLocale: 'en', locales: ['en']},
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/AgentGino/llm-basics/tree/main/',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {defaultMode: 'dark', disableSwitch: false, respectPrefersColorScheme: true},
    navbar: {
      title: 'LLM Basics',
      logo: {alt: 'LLM Basics', src: 'img/logo.svg'},
      items: [
        {to: '/docs/', label: 'Study path', position: 'left'},
        {to: '/docs/llm-fundamentals', label: 'Start learning', position: 'left'},
        {href: 'https://github.com/AgentGino/llm-basics', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {title: 'Learn', items: [{label: 'Study path', to: '/docs/'}, {label: 'LLM fundamentals', to: '/docs/llm-fundamentals'}]},
        {title: 'Project', items: [{label: 'GitHub repository', href: 'https://github.com/AgentGino/llm-basics'}]},
      ],
      copyright: `Built for focused learning · ${new Date().getFullYear()} LLM Basics`,
    },
    prism: {theme: prismThemes.github, darkTheme: prismThemes.dracula},
  } satisfies Preset.ThemeConfig,
};

export default config;
