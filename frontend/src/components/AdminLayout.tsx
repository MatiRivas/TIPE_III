import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const links = [
  { to: '/dashboard',        label: '📊 Dashboard' },
  { to: '/admin/users',      label: '👥 Usuarios' },
  { to: '/admin/discounts',  label: '🏷️ Descuentos' },
  { to: '/inventory',        label: '📦 Inventario' },
  { to: '/reports',          label: '📈 Reportes' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#01696f', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
        <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, padding: '0 20px 20px', margin: 0, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          🍹 Mojito Bar
        </p>
        <nav style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' }}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}
              style={({ isActive }) => ({
                padding: '10px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? '#01696f' : 'rgba(255,255,255,0.85)',
                background: isActive ? '#fff' : 'transparent',
                transition: 'all 0.15s',
              })}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #ececec', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
            Sesion activa: <strong>{user?.name ?? 'Usuario'}</strong> ({user?.role ?? 'ADMIN'})
          </div>
          <button
            onClick={logout}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#a12c7b', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            Cerrar sesion
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}