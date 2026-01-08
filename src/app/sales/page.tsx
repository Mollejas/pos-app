'use client';

import { useState, useEffect } from 'react';
import { Sale, SaleDetail, Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { X, Loader2, Eye } from 'lucide-react';

export default function SalesListPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [details, setDetails] = useState<SaleDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          fetch('/api/sales'),
          fetch('/api/products')
        ]);
        
        const salesData = await salesRes.json();
        const productsData = await productsRes.json();

        if (Array.isArray(salesData)) setSales(salesData);
        if (Array.isArray(productsData)) setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleViewDetails = async (sale: Sale) => {
    setSelectedSale(sale);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/sales?folio=${sale.folio}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDetails(data);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getProductDescription = (code: string) => {
    const product = products.find(p => p.code === code);
    return product ? product.description : 'Producto no encontrado';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Historial de Remisiones 📋</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Folio</th>
                <th className="p-4 font-semibold text-gray-600">Fecha</th>
                <th className="p-4 font-semibold text-gray-600">Cliente</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Total</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.folio} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-medium text-blue-600">#{sale.folio}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-gray-800 font-medium">{sale.customerId}</td>
                    <td className="p-4 text-right font-bold text-green-700">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetails(sale)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Detalle de Remisión #{selectedSale.folio}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedSale.date).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-600">Código</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Descripción</th>
                        <th className="p-3 text-center font-semibold text-gray-600">Cant.</th>
                        <th className="p-3 text-right font-semibold text-gray-600">Precio</th>
                        <th className="p-3 text-right font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {details.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-gray-500">{detail.productCode}</td>
                          <td className="p-3 text-gray-800">{getProductDescription(detail.productCode)}</td>
                          <td className="p-3 text-center font-medium">{detail.quantity}</td>
                          <td className="p-3 text-right text-gray-600">{formatCurrency(detail.price)}</td>
                          <td className="p-3 text-right font-bold text-gray-800">{formatCurrency(detail.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-bold border-t">
                      <tr>
                        <td colSpan={4} className="p-3 text-right text-gray-600">Total General:</td>
                        <td className="p-3 text-right text-green-700 text-lg">
                          {formatCurrency(selectedSale.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setSelectedSale(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
