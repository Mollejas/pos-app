'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({ code: '', description: '', price: 0, image: '' });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    } else {
      setCheckingAuth(false);
      fetchProducts();
    }
  }, [router]);

  // Function to compress image before saving
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality to keep string short for Google Sheets
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setForm(prev => ({ ...prev, image: dataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Error fetching products:', data);
          setProducts([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setProducts([]);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingCode ? 'PUT' : 'POST';
      const body = editingCode ? { ...form, code: editingCode } : form;

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm({ code: '', description: '', price: 0, image: '' });
      setEditingCode(null);
      fetchProducts();
      alert(editingCode ? 'Producto actualizado' : 'Producto creado');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm(product);
    setEditingCode(product.code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ code: '', description: '', price: 0, image: '' });
    setEditingCode(null);
  };

  const filteredProducts = products.filter(p => 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (checkingAuth) return <div className="p-8">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <h1 className="text-2xl font-bold">Catálogo de Productos 📦</h1>
      
      {/* Formulario de creación/edición */}
      <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-white shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {editingCode ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                placeholder="Ej: A001"
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                required
                disabled={!!editingCode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                required
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Nombre del producto..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
            
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                 <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border p-2 rounded text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <input
                  type="text"
                  placeholder="O pegar URL de imagen..."
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full border p-2 rounded text-sm mt-2"
                />
              </div>
              
              {form.image && (
                <div className="shrink-0 border rounded p-1">
                  <img src={form.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex-1 text-white p-2 rounded font-medium transition-colors ${
                editingCode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {loading ? 'Guardando...' : (editingCode ? 'Actualizar Producto' : 'Guardar Producto')}
            </button>
            
            {editingCode && (
              <button 
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Lista de productos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold">Listado de Productos</h2>
          <input
            type="text"
            placeholder="🔍 Buscar por código o nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid gap-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
              No se encontraron productos
            </div>
          ) : (
            filteredProducts.map(p => (
              <div key={p.code} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center bg-white shadow-sm gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {p.image ? (
                    <img src={p.image} alt={p.description} className="w-16 h-16 object-cover rounded bg-gray-50 border" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border">Sin foto</div>
                  )}
                  <div>
                    <div className="font-bold text-gray-900">{p.description}</div>
                    <div className="text-sm text-gray-500 font-mono">Código: {p.code}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-[80px] sm:pl-0">
                  <div className="text-green-600 font-bold text-xl">
                    {formatCurrency(Number(p.price))}
                  </div>
                  <button
                    onClick={() => handleEdit(p)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium border border-blue-200"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
