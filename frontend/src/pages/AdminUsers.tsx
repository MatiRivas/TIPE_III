import { useEffect, useState } from 'react';
import { usersApi } from '../api/users.api';
import type { User, CreateUserPayload, UpdateUserPayload, Role } from '../types/user.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ROLES: Role[] = ['ADMIN', 'VENDEDOR'];
const roleLabel: Record<Role, string> = { ADMIN: '🛡️ Admin', VENDEDOR: '🧑‍💼 Vendedor' };
const roleColor: Record<Role, { bg: string; color: string }> = {
  ADMIN:    { bg: '#e8f0fe', color: '#1a56db' },
  VENDEDOR: { bg: '#e6f4ea', color: '#2d7a3a' },
};
const PROTECTED_ADMIN_EMAIL = (import.meta.env.VITE_PROTECTED_ADMIN_EMAIL ?? 'admin@mojitobar.cl').toLowerCase();

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}
function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Form field ──────────────────────────────────────────────────────────────
interface FieldProps { label: string; children: React.ReactNode }
function Field({ label, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd',
  fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};

// ─── Confirm delete ──────────────────────────────────────────────────────────
interface ConfirmDeleteProps { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean }
function ConfirmDelete({ name, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  return (
    <Modal title="Eliminar usuario" onClose={onCancel}>
      <p style={{ color: '#555', fontSize: 14, margin: '0 0 20px' }}>
        ¿Seguro que quieres eliminar a <strong>{name}</strong>? Esta acción no se puede deshacer.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancelar</button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#a12c7b', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
interface UserFormProps {
  initial?: User;
  onSave: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string | null;
}
function UserForm({ initial, onSave, onClose, loading, error }: UserFormProps) {
  const [name, setName]       = useState(initial?.name ?? '');
  const [email, setEmail]     = useState(initial?.email ?? '');
  const [role, setRole]       = useState<Role>(initial?.role ?? 'VENDEDOR');
  const [password, setPassword] = useState('');

  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateUserPayload | UpdateUserPayload = isEdit
      ? { name, email, role, ...(password ? { password } : {}) }
      : { name, email, role, password };
    await onSave(payload);
  };

  return (
    <Modal title={isEdit ? 'Editar usuario' : 'Crear usuario'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Field label="Nombre">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ej: María López" />
        </Field>
        <Field label="Email">
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="usuario@mojito.cl" />
        </Field>
        <Field label="Contraseña">
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
            required={!isEdit} minLength={6}
          />
        </Field>
        <Field label="Rol">
          <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
          </select>
        </Field>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#c0392b', marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Cancelar</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#01696f', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [formError, setFormError]   = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const [showCreate, setShowCreate]           = useState(false);
  const [editUser, setEditUser]               = useState<User | null>(null);
  const [deleteUser, setDeleteUser]           = useState<User | null>(null);
  const [deletingId, setDeletingId]           = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (payload: CreateUserPayload | UpdateUserPayload) => {
    setSaving(true); setFormError(null);
    try {
      await usersApi.create(payload as CreateUserPayload);
      setShowCreate(false);
      await load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al crear usuario');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (payload: CreateUserPayload | UpdateUserPayload) => {
    if (!editUser) return;
    setSaving(true); setFormError(null);
    try {
      await usersApi.update(editUser.id, payload as UpdateUserPayload);
      setEditUser(null);
      await load();
    } catch (e: any) {
      setFormError(e?.response?.data?.message ?? 'Error al actualizar usuario');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeletingId(deleteUser.id);
    try {
      await usersApi.remove(deleteUser.id);
      setDeleteUser(null);
      await load();
    } catch {
      setError('Error al eliminar usuario');
    } finally { setDeletingId(null); }
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f6fa', minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>👥 Gestión de Usuarios</h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { setFormError(null); setShowCreate(true); }}
            style={{ padding: '9px 20px', borderRadius: 9, border: 'none', background: '#01696f', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            + Nuevo usuario
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar por nombre o email..."
            style={{ flex: '1 1 200px', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
          />
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
            {(['ALL', 'ADMIN', 'VENDEDOR'] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: roleFilter === r ? '#01696f' : '#fff',
                  color: roleFilter === r ? '#fff' : '#555' }}>
                {r === 'ALL' ? 'Todos' : roleLabel[r]}
              </button>
            ))}
          </div>
        </div>

        {/* Error global */}
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#c0392b', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Tabla */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 14 }}>Cargando usuarios...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <span style={{ fontSize: 36 }}>👤</span>
              <p style={{ color: '#aaa', margin: '8px 0 0', fontSize: 14 }}>No se encontraron usuarios</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8f8f8', borderBottom: '2px solid #f0f0f0' }}>
                  {['Nombre', 'Email', 'Rol', 'Creado', 'Acciones'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  (() => {
                    const isProtectedAdmin = u.email.toLowerCase() === PROTECTED_ADMIN_EMAIL;
                    return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1a1a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#01696f20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#01696f', fontSize: 13, flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, ...roleColor[u.role] }}>
                        {roleLabel[u.role]}
                      </span>
                      {isProtectedAdmin && (
                        <span style={{ marginLeft: 8, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#fff0f0', color: '#a12c7b' }}>
                          Protegida
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#888' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setFormError(null); setEditUser(u); }}
                          style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#333' }}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => !isProtectedAdmin && setDeleteUser(u)} disabled={isProtectedAdmin}
                          title={isProtectedAdmin ? 'La cuenta admin protegida no se puede eliminar' : 'Eliminar usuario'}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 7,
                            border: 'none',
                            background: isProtectedAdmin ? '#f3f3f3' : '#fff0f8',
                            cursor: isProtectedAdmin ? 'not-allowed' : 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            color: isProtectedAdmin ? '#999' : '#a12c7b',
                          }}>
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modales */}
      {showCreate && <UserForm onSave={handleCreate} onClose={() => setShowCreate(false)} loading={saving} error={formError} />}
      {editUser   && <UserForm initial={editUser} onSave={handleUpdate} onClose={() => setEditUser(null)} loading={saving} error={formError} />}
      {deleteUser && <ConfirmDelete name={deleteUser.name} onConfirm={handleDelete} onCancel={() => setDeleteUser(null)} loading={deletingId === deleteUser.id} />}
    </div>
  );
}