import { NavLink, useMatch } from "react-router-dom";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "Cafés", end: true, icon: "cafes" },
  { to: "/saved", label: "Saved", end: false, icon: "saved" },
  { to: "/visits", label: "Visits", end: false, icon: "visits" },
] as const;

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  if (name === "cafes") {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.2c0 0 6.5-5.7 6.5-10.6a6.5 6.5 0 1 0-13 0c0 4.9 6.5 10.6 6.5 10.6z" />
        <circle className="nav-icon-dot" cx="12" cy="10.6" r="2" />
      </svg>
    );
  }
  if (name === "saved") {
    return (
      <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.1L6 20V5.5a1 1 0 0 1 1-1z" />
      </svg>
    );
  }
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" />
      <path className="nav-icon-hands" d="M12 8.25V12l2.6 1.7" />
    </svg>
  );
}

function NavLinks({ withIcons = false }: { withIcons?: boolean }) {
  return (
    <>
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end}>
          {withIcons ? <NavIcon name={link.icon} /> : null}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const exploring = useMatch({ path: "/", end: true });

  return (
    <div className={exploring ? "shell shell-explore" : "shell"}>
      <nav className="top-nav" aria-label="Primary">
        <NavLinks />
      </nav>
      <main className="content">{children}</main>
      <nav className="bottom-nav" aria-label="Primary">
        <NavLinks withIcons />
      </nav>
    </div>
  );
}
