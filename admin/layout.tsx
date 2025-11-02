'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    // Don't await the signout process to make the redirect feel instantaneous.
    // The session will be invalidated in the background.
    signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const navLinks = {
    Overview: [{ name: 'Dashboard', href: '/admin', icon: 'bi-grid' }],
    Moderation: [
      {
        name: 'Flagged Reviews',
        href: '/admin/moderation/flagged-reviews',
        icon: 'bi-flag',
      },
    ],
    Users: [
      { name: 'User Directory', href: '/admin/users', icon: 'bi-people' },
    ],
    Content: [
      { name: 'All Reviews', href: '/admin/reviews', icon: 'bi-star' },
      { name: 'All Comments', href: '/admin/comments', icon: 'bi-chat-dots' },
    ],
    Communication: [
      {
        name: 'Support Messages',
        href: '/admin/support',
        icon: 'bi-headset',
      },
      {
        name: 'Notifications',
        href: '/admin/notifications',
        icon: 'bi-bell',
      },
    ],
    Analytics: [
      {
        name: 'Deep Dive',
        href: '/admin/analytics',
        icon: 'bi-pie-chart',
      },
      {
        name: 'User Activity',
        href: '/admin/analytics/user-activity',
        icon: 'bi-person-lines-fill',
      },
    ],
  };

  return (
    <div className="d-flex vh-100">
      <aside
        className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
        style={{ width: '280px' }}
      >
        <Link
          href="/admin"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
        >
          <i className="bi bi-box-seam fs-4 me-2"></i>
          <span className="fs-4">FlatFacts Admin</span>
        </Link>
        <hr />
        <div className="flex-grow-1 overflow-y-auto">
          <ul className="nav nav-pills flex-column">
            {Object.entries(navLinks).map(([category, links]) => (
              <div key={category}>
                {category !== 'Overview' && (
                  <h6 className="nav-link text-secondary text-uppercase fs-7 mt-2">
                    {category}
                  </h6>
                )}
                {links.map((link) => (
                  <li className="nav-item" key={link.name}>
                    <Link
                      href={link.href}
                      className={`nav-link text-white ${pathname === link.href ? 'active' : ''
                        }`}
                    >
                      <i className={`bi ${link.icon} me-2`}></i>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </div>
            ))}
          </ul>
        </div>
        <hr />
        <div className="dropdown">
          <a
            href="#"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle fs-4 me-2"></i>
            <strong>Admin</strong>
          </a>
          <ul
            className="dropdown-menu dropdown-menu-dark text-small shadow"
            aria-labelledby="dropdownUser1"
          >
            <li>
              <Link className="dropdown-item" href="/admin/profile">
                <i className="bi bi-person-fill me-2"></i>
                Profile
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <a className="dropdown-item text-danger" href="#" onClick={handleSignOut}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign out
              </a>
            </li>
          </ul>
        </div>
      </aside>

      <main className="flex-grow-1 p-4 bg-body-tertiary overflow-auto">
        {children}
      </main>
    </div>
  );
}
