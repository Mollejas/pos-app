'use client';
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({ code: '', description: '', price: 0, image: '' });
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ code: '', description: '', price: 0, image: '' });
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catálogo de Productos</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-gray-50 max-w-lg">
        <h2 className="text-lg font-semibold mb-2">Agregar Producto</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Código"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.price}
            onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })}
            className="w-full border p-2 rounded"
            required
            step="0.01"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border p-2 rounded"
            />
            {form.image && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Vista previa:</p>
                <img src={form.image} alt="Preview" className="w-24 h-24 object-cover rounded border" />
              </div>
            )}
            <input
              type="text"
              placeholder="O pegar URL de imagen..."
              value={form.image}
              onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full border p-2 rounded text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded w-full disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>

      <div className="grid gap-2">
        {products.map(p => (
          <div key={p.code} className="border p-3 rounded flex flex-col sm:flex-row justify-between sm:items-center bg-white shadow-sm gap-2">
            <div className="flex items-start sm:items-center gap-3">
              {p.image ? (
                <img src={p.image} alt={p.description} className="w-16 h-16 object-cover rounded bg-gray-50" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Sin foto</div>
              )}
              <div>
                <div className="font-bold text-sm sm:text-base">{p.description}</div>
                <div className="text-xs sm:text-sm text-gray-500">Código: {p.code}</div>
              </div>
            </div>
            <div className="text-green-600 font-bold text-lg sm:text-right w-full sm:w-auto pl-[76px] sm:pl-0">
              ${p.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
