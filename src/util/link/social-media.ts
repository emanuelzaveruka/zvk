import type { LinkProps } from '../../types/link';

export const SocialMediaLinks: LinkProps[] = [
  {
    id: 1,
    label: 'Github',
    title: 'Star my projects on Github.',
    href: 'https://github.com/emanuelzaveruka',
    icon: 'mdi:github'
  },
  {
    id: 2,
    label: 'LinkedIn',
    title: 'Connect with me on LinkedIn.',
    href: 'https://linkedin.com/in/emanuelzaveruka',
    icon: 'mdi:linkedin'
  },
  {
    id: 3,
    label: 'Mail',
    title: 'Send me an email.',
    href: 'mailto:emanuel@emanuelzaveruka.com',
    icon: 'mdi:at'
  },
  {
    id: 4,
    label: 'WhatsApp',
    title: 'Fale comigo no WhatsApp.',
    // wa.me exige só dígitos, com país e DDD.
    href: 'https://wa.me/5541997399754',
    icon: 'mdi:whatsapp'
  },
  {
    id: 5,
    label: 'Discord',
    title: 'Invite for ZVK chat.',
    href: 'https://discord.gg/SCc2Q8aV',
    icon: 'mdi:discord'
  },
];
