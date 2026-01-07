'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: 'user',
    numeroalmacen: ''
  });
  const [creating, setCreating] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar si es admin (simple check)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
      alert('No tienes permisos para ver esta página');
      router.push('/');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const method = editingEmail ? 'PUT' : 'POST';
      const body = editingEmail ? { ...form, email: editingEmail } : form; // Si editamos, usamos el email original como ID

      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({ email: '', password: '', role: 'user', numeroalmacen: '' });
      setEditingEmail(null);
      fetchUsers();
      alert(editingEmail ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: User) => {
    setForm({
      email: user.email,
      password: '', // No mostramos la contraseña por seguridad, si la deja vacía no se actualiza (lógica a implementar en backend si se desea, o requerir nueva)
      role: user.role,
      numeroalmacen: user.numeroalmacen
    });
    setEditingEmail(user.email);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (email: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const res = await fetch(`/api/users?email=${email}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      fetchUsers();
      alert('Usuario eliminado exitosamente');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCancelEdit = () => {
    setForm({ email: '', password: '', role: 'user', numeroalmacen: '' });
    setEditingEmail(null);
  };

  if (loading) return <div className="p-4">Cargando usuarios...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

      {/* Formulario de creación/edición */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">{editingEmail ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              disabled={!!editingEmail} // No permitir cambiar email al editar porque es el ID
              className={`w-full border p-2 rounded ${editingEmail ? 'bg-gray-100' : ''}`}
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña {editingEmail && '(Dejar en blanco para mantener actual)'}</label>
            <input
              type="password"
              required={!editingEmail} // Solo requerida al crear
              className="w-full border p-2 rounded"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              className="w-full border p-2 rounded"
              value={form.role}
              onChange={e => setForm({...form, role: e.target.value})}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Número de Almacén</label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded"
              value={form.numeroalmacen}
              onChange={e => setForm({...form, numeroalmacen: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className={`${editingEmail ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded w-full md:w-auto`}
            >
              {creating ? 'Guardando...' : (editingEmail ? 'Actualizar Usuario' : 'Crear Usuario')}
            </button>
            {editingEmail && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full md:w-auto"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Usuarios Existentes</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Almacén</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3">{user.numeroalmacen}</td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.email)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
