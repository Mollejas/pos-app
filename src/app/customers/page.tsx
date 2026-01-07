'use client';
import { useState, useEffect } from 'react';
import { Customer } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Customer>({ id: '', name: '', email: '', phone: '' });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    } else {
      fetchCustomers();
    }
  }, [router]);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          console.error('Error fetching customers:', data);
          setCustomers([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch customers', err);
        setCustomers([]);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-generate ID if empty? Or let user type it. Let's use timestamp for now if empty.
    const customer = { ...form, id: form.id || Date.now().toString() };
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    setForm({ id: '', name: '', email: '', phone: '' });
    fetchCustomers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo de Clientes</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-gray-50 max-w-lg">
        <h2 className="text-lg font-semibold mb-2">Agregar Cliente</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="ID (Opcional)"
            value={form.id}
            onChange={e => setForm({ ...form, id: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full border p-2 rounded"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Guardar</button>
        </div>
      </form>

      <div className="grid gap-2">
        {customers.map(c => (
          <div key={c.id} className="border p-3 rounded bg-white shadow-sm">
            <div className="font-bold">{c.name}</div>
            <div className="text-sm text-gray-500">ID: {c.id}</div>
            <div className="text-sm">Email: {c.email} | Tel: {c.phone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
