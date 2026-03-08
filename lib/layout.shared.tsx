import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    themeSwitch: {
      enabled: true,
      mode: 'light-dark-system',
    },
    nav: {
      title: 'Vine API Docs',
      url: '/docs',
    },
    links: [
      {
        text: 'Go Home',
        url: '/',
      },
      {
        text: 'Docs',
        url: '/docs',
      },
    ],
  };
}
