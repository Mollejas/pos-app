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
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({ email: '', password: '', role: 'user', numeroalmacen: '' });
      fetchUsers();
      alert('Usuario creado exitosamente');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-4">Cargando usuarios...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

      {/* Formulario de creación */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Agregar Nuevo Usuario</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full border p-2 rounded"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              required
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
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full md:w-auto"
            >
              {creating ? 'Guardando...' : 'Crear Usuario'}
            </button>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
