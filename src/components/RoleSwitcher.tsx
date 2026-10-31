'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, User, Heart, Briefcase, ShieldCheck, Shield } from 'lucide-react';
import { ROLES, ROLE_CONFIG, type Role } from '@/types/roles';
import { useRole } from '@/providers/RoleProvider';

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  donor: <Heart className="h-4 w-4 text-primary" aria-hidden="true" />,
  ngo: <Briefcase className="h-4 w-4 text-warning" aria-hidden="true" />,
  auditor: <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />,
  admin: <Shield className="h-4 w-4 text-danger" aria-hidden="true" />,
};

const ROLE_PRIMARY_ROUTES: Record<Role, string> = {
  donor: '/campaigns',
  ngo: '/ngo',
  auditor: '/auditor',
  admin: '/admin',
};

export function RoleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useRole();

  const handleRoleChange = (nextRole: Role) => {
    setRole(nextRole);
    // Navigate automatically to that role's primary dashboard
    const targetRoute = ROLE_PRIMARY_ROUTES[nextRole];
    if (targetRoute && pathname !== targetRoute) {
      router.push(targetRoute);
    }
  };

  return (
    <div role="group" aria-labelledby="role-switcher-label" className="flex flex-wrap items-center gap-2">
      <span id="role-switcher-label" className="text-xs font-bold text-muted uppercase tracking-wider">
        Viewing As:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {ROLES.map((id) => {
          const config = ROLE_CONFIG[id];
          const active = role === id;

          return (
            <button
              key={id}
              type="button"
              className={`btn text-xs py-1.5 px-3 transition-all ${
                active
                  ? 'btn-primary shadow-sm font-bold ring-2 ring-primary ring-offset-2'
                  : 'btn-secondary text-muted hover:text-ink'
              }`}
              aria-pressed={active}
              onClick={() => handleRoleChange(id)}
              title={`Switch to ${config.label} and open ${config.label} portal`}
            >
              <span className="flex items-center gap-1.5">
                {ROLE_ICONS[id]}
                <span>{config.label}</span>
              </span>
              {active && <Check aria-hidden="true" className="h-3.5 w-3.5 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}