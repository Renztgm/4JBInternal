import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import "./app-layout.css";

const NAV = [
  { to: "/payslips", label: "My payslips" },
  { to: "/employees", label: "Employees", roles: ["ADMIN", "HR"] },
  { to: "/payroll", label: "Payroll runs", roles: ["ADMIN", "HR"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const links = NAV.filter((n) => !n.roles || n.roles.includes(user.role));

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="sidebar-brand">Payroll</p>
        <nav>
          {links.map((n) => (
            <NavLink key={n.to} to={n.to}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span>{user.email}</span>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}