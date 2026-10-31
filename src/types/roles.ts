export type Role = 'donor' | 'ngo' | 'auditor' | 'admin';

export const ROLES: readonly Role[] = ['donor', 'ngo', 'auditor', 'admin'];
export const DEFAULT_ROLE: Role = 'donor';

export interface NavItem {
  href: string;
  label: string;
}

export interface RoleConfig {
  id: Role;
  label: string;   // short name on the switcher button
  hint: string;    // plain-language description under the name
  summary: string; // one sentence shown on the home page
  nav: readonly NavItem[];
}

export const ROLE_CONFIG: Record<Role, RoleConfig> = {
  donor: {
    id: 'donor',
    label: 'Donor',
    hint: 'I want to give',
    summary: 'Choose a cause, give safely, and follow every rupee from your donation to the people it helps.',
    nav: [
      { href: '/campaigns', label: 'Browse Causes' },
      { href: '/my-giving', label: 'My Giving' },
      { href: '/audit', label: 'Follow the Money' },
    ],
  },
  ngo: {
    id: 'ngo',
    label: 'Charity (NGO)',
    hint: 'I run a charity',
    summary: 'Start a campaign, set its stages, and upload proof of your work to receive each payment.',
    nav: [
      { href: '/ngo', label: 'My Campaigns' },
      { href: '/campaigns/new', label: 'Start a Campaign' },
      { href: '/ngo/proof', label: 'Upload Proof' },
    ],
  },
  auditor: {
    id: 'auditor',
    label: 'Auditor',
    hint: 'I check proof',
    summary: 'Review proof from charities and cast your vote. Money is paid out once enough auditors agree.',
    nav: [
      { href: '/auditor', label: 'Proofs to Check' },
      { href: '/auditor/history', label: 'My Past Votes' },
    ],
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    hint: 'I manage the platform',
    summary: 'Manage the panel of auditors, and use the demo controls to load sample data or reset.',
    nav: [
      { href: '/admin', label: 'Overview' },
      { href: '/admin/auditors', label: 'Auditor Panel' },
      { href: '/admin/demo', label: 'Demo Controls' },
    ],
  },
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}