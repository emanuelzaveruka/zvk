import type { LinkProps } from '../../types/link';

export const NavLinks: LinkProps[] = [
  {
    id: 1,
    label: 'Home',
    title: 'Go to home.',
    href: '/',
    icon: 'mdi:home-variant'
  },
  {
    id: 2,
    label: 'Posts',
    title: 'View My Posts.',
    href: '/posts',
    icon: 'mdi:post-outline'
  }
];
