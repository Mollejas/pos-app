'use client';
import { useState, useEffect, useRef } from 'react';
import { Product, Customer, Sale, SaleDetail } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Scanner from './Scanner';
import { generateTicket } from '@/lib/pdf';
import { Trash2, Printer, Camera, X, ChevronDown } from 'lucide-react';

export default function POSInterface() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  // State for Price Modal
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInputValue, setPriceInputValue] = useState('');
  const [quantityInputValue, setQuantityInputValue] = useState('1');
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [editingPriceCode, setEditingPriceCode] = useState<string | null>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when modal opens
    if (showPriceModal && priceInputRef.current) {
      setTimeout(() => priceInputRef.current?.focus(), 100);
    }
  }, [showPriceModal]);

  useEffect(() => {
    // Sync filtered customers with all customers initially
    setFilteredCustomers(customers);
  }, [customers]);

  useEffect(() => {
    // Filter customers when query changes
    if (!customerSearchQuery.trim()) {
      setFilteredCustomers(customers);
    } else {
      const lower = customerSearchQuery.toLowerCase();
      setFilteredCustomers(customers.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        (c.phone && c.phone.includes(lower))
      ));
    }
  }, [customerSearchQuery, customers]);

  useEffect(() => {
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
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchResults([]); // Clear results to disable dropdown
  };

  const executeAddToCart = (product: Product, finalPrice: number, quantityToAdd: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.code === product.code);
      if (existingIndex >= 0) {
        // Si ya existe, actualizamos cantidad
        const newCart = [...prev];
        const item = newCart[existingIndex];
        
        // Si el producto original tiene precio 0, actualizamos al último ingresado.
        const priceToUpdate = product.price === 0 ? finalPrice : item.product.price;

        newCart[existingIndex] = {
          ...item,
          quantity: item.quantity + quantityToAdd,
          product: { ...item.product, price: priceToUpdate }
        };
        return newCart;
      }
      // Nuevo item
      return [...prev, { 
        product: { ...product, price: finalPrice }, 
        quantity: quantityToAdd 
      }];
    });
    setShowScanner(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addToCart = (code: string) => {
    const originalProduct = products.find(p => p.code === code);
    if (originalProduct) {
      setPendingProduct(originalProduct);
      setPriceInputValue(originalProduct.price === 0 ? '' : originalProduct.price.toString());
      setQuantityInputValue('1');
      setShowPriceModal(true);
    } else {
      alert('Producto no encontrado');
    }
  };

  const updateItem = (code: string, currentPrice: number, currentQuantity: number) => {
    setEditingPriceCode(code);
    setPriceInputValue(currentPrice.toString());
    setQuantityInputValue(currentQuantity.toString());
    setShowPriceModal(true);
  };

  const handlePriceConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const price = parseFloat(priceInputValue);
    const quantity = parseFloat(quantityInputValue);

    if (isNaN(price) || price < 0) return;
    if (isNaN(quantity) || quantity <= 0) return;

    if (pendingProduct) {
      executeAddToCart(pendingProduct, price, quantity);
      setPendingProduct(null);
    } else if (editingPriceCode) {
      setCart(prev => prev.map(item => {
        if (item.product.code === editingPriceCode) {
          return { ...item, quantity, product: { ...item.product, price } };
        }
        return item;
      }));
      setEditingPriceCode(null);
    }
    setShowPriceModal(false);
  };

  const removeFromCart = (code: string) => {
    setCart(prev => prev.filter(item => item.product.code !== code));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    const saleData = {
      sale: {
        date: new Date().toISOString(),
        customerId: selectedCustomer || 'PUBLICO GENERAL',
        total
      },
      details: cart.map(item => ({
        productCode: item.product.code,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity
      }))
    };

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      const data = await res.json();
      
      if (data.success) {
        // Generate PDF
        const sale: Sale = { ...saleData.sale, folio: data.folio };
        const details: SaleDetail[] = saleData.details.map(d => ({ ...d, folio: data.folio }));
        generateTicket(sale, details, products);
        
        // Reset
        setCart([]);
        alert(`Venta guardada con Folio: ${data.folio}`);
      } else {
        alert('Error al guardar la venta');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] md:h-[calc(100vh-100px)] gap-2 md:gap-4 relative">
      {/* Top Bar: Search & Scanner */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="text" 
          placeholder="Escanear código o buscar..." 
          className="flex-1 border p-3 rounded text-base md:text-lg shadow-sm w-full"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const exactMatch = products.find(p => p.code === searchQuery);
              if (exactMatch) {
                addToCart(exactMatch.code);
              } else if (searchResults.length === 1) {
                addToCart(searchResults[0].code);
              }
            }
          }}
        />
        <button 
          onClick={() => setShowScanner(!showScanner)}
          className="bg-blue-600 text-white px-4 py-3 rounded font-bold shadow-sm hover:bg-blue-700 flex items-center justify-center gap-2 sm:w-auto w-full"
        >
          <Camera size={20} /> <span className="sm:inline">Escanear</span>
        </button>
      </div>

      {showScanner && (
        <div className="border p-2 md:p-4 rounded bg-gray-100 shadow-inner">
          <Scanner onScan={(code) => {
            addToCart(code);
            // Optional: Close scanner after scan if desired
            // setShowScanner(false);
          }} />
          <button onClick={() => setShowScanner(false)} className="mt-2 text-red-500 w-full text-center py-2">Cerrar Escáner</button>
        </div>
      )}

      {/* Main Area: The Cart */}
      <div className="flex-1 bg-white border rounded shadow-md flex flex-col overflow-hidden">
        {/* Cart Header */}
        <div className="p-3 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">Lista de Captura</h2>
          
          {/* Customer Searchable Dropdown */}
          <div className="relative w-full sm:w-72">
            <div className="flex items-center border rounded bg-white relative">
              <input
                type="text"
                placeholder="Buscar Cliente..."
                className="w-full p-2 text-sm rounded outline-none"
                value={selectedCustomer ? selectedCustomer : customerSearchQuery}
                onChange={(e) => {
                  setSelectedCustomer(''); // Clear selection when typing
                  setCustomerSearchQuery(e.target.value);
                  setShowCustomerResults(true);
                }}
                onFocus={() => {
                  setCustomerSearchQuery('');
                  setShowCustomerResults(true);
                }}
                onBlur={() => setTimeout(() => setShowCustomerResults(false), 200)}
              />
              {selectedCustomer ? (
                 <button 
                   onClick={() => {
                     setSelectedCustomer('');
                     setCustomerSearchQuery('');
                   }}
                   className="p-2 text-gray-400 hover:text-red-500"
                 >
                   <X size={16} />
                 </button>
              ) : (
                 <div className="p-2 text-gray-400">
                   <ChevronDown size={16} />
                 </div>
              )}
            </div>

            {/* Results List */}
            {showCustomerResults && (
              <div className="absolute top-full left-0 w-full bg-white border rounded shadow-xl max-h-60 overflow-y-auto z-20 mt-1">
                <div 
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm font-bold text-gray-600 border-b"
                  onClick={() => {
                    setSelectedCustomer('');
                    setCustomerSearchQuery('');
                    setShowCustomerResults(false);
                  }}
                >
                  Público General
                </div>
                {filteredCustomers.length === 0 ? (
                  <div className="p-2 text-sm text-gray-400">No se encontraron clientes</div>
                ) : (
                  filteredCustomers.map(c => (
                    <div 
                      key={c.id} 
                      className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                      onClick={() => {
                        setSelectedCustomer(c.name);
                        setCustomerSearchQuery(''); // We use selectedCustomer for display
                        setShowCustomerResults(false);
                      }}
                    >
                      <div className="font-bold">{c.name}</div>
                      {c.phone && <div className="text-xs text-gray-500">{c.phone}</div>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 bg-gray-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
              <p className="text-xl mb-2">Carrito vacío</p>
              <p className="text-sm">Escanea o busca un producto</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="bg-white p-2 rounded border shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 relative">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.description} className="w-16 h-16 object-cover rounded border" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-[10px] text-center p-1">Sin Imagen</div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 leading-tight mb-1">{item.product.description}</div>
                  <div className="text-xs text-gray-500 font-mono mb-1">{item.product.code}</div>
                  
                  {/* Quantity & Price - Mobile Optimized */}
                  <div className="flex justify-between items-end mt-1">
                     <div className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">Cant: {item.quantity}</span> 
                        {item.product.price === 0 || item.product.description.includes('(Abierto)') ? (
                          <div className="flex items-center gap-1">
                            <span>x $</span>
                            <input
                              type="number"
                              className="w-20 border rounded px-1 py-0.5 text-sm"
                              value={item.product.price === 0 ? '' : item.product.price}
                              placeholder="0.00"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val >= 0) {
                                  // Update price directly
                                  setCart(prev => prev.map(pItem => 
                                    pItem.product.code === item.product.code 
                                      ? { ...pItem, product: { ...pItem.product, price: val } }
                                      : pItem
                                  ));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <button 
                            onClick={() => updateItem(item.product.code, item.product.price, item.quantity)}
                            className="hover:bg-gray-100 px-1 rounded text-blue-600 underline decoration-dotted"
                            title="Editar precio"
                          >
                            x {formatCurrency(item.product.price)}
                          </button>
                        )}
                     </div>
                     <div className="font-bold text-lg text-blue-600">
                        ${(item.quantity * item.product.price).toFixed(2)}
                     </div>
                  </div>
                </div>

                {/* Delete Action - Absolute position for cleaner look on mobile */}
                <button 
                  onClick={() => removeFromCart(item.product.code)}
                  className="text-red-400 hover:text-red-600 p-1 -mt-1 -mr-1"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: Totals & Checkout */}
        <div className="p-3 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 font-medium">Total:</span>
            <span className="text-3xl font-bold text-green-700">{formatCurrency(total)}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-colors shadow-lg active:scale-95"
          >
            {loading ? 'Procesando...' : (
              <>
                <Printer size={20} />
                <span>Cobrar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {pendingProduct 
                ? `Agregar "${pendingProduct.description}"` 
                : 'Editar Item'}
            </h3>
            
            <form onSubmit={handlePriceConfirm}>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      ref={priceInputRef}
                      type="number"
                      step="0.01"
                      className="w-full border rounded pl-8 pr-3 py-2 text-lg font-bold"
                      placeholder="0.00"
                      value={priceInputValue}
                      onChange={(e) => setPriceInputValue(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cant.</label>
                  <input
                    type="number"
                    step="1"
                    className="w-full border rounded px-3 py-2 text-lg font-bold text-center"
                    placeholder="1"
                    value={quantityInputValue}
                    onChange={(e) => setQuantityInputValue(e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceModal(false);
                    setPendingProduct(null);
                    setEditingPriceCode(null);
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
