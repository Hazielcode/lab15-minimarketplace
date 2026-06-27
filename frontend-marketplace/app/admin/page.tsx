'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Category, User } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // 1. Verificar autenticación del lado del cliente
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setToken(storedToken);
      setUser(parsedUser);
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  // 2. Cargar productos y categorías cuando el token esté disponible
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargar productos
        const prodRes = await fetch(`${API_BASE_URL}/api/products`);
        if (!prodRes.ok) throw new Error('Error al cargar productos');
        const prodData = await prodRes.json();
        setProducts(prodData);

        // Cargar categorías
        const catRes = await fetch(`${API_BASE_URL}/api/categories`);
        if (!catRes.ok) throw new Error('Error al cargar categorías');
        const catData = await catRes.json();
        setCategories(catData);
      } catch (err: any) {
        setError(err.message || 'Error al obtener los datos del servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // 3. Abrir modal para crear
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setNombre('');
    setDescripcion('');
    setPrecio(0);
    setStock(0);
    setCategoryId('');
    setImageUrl('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // 4. Abrir modal para editar
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setNombre(product.nombre);
    setDescripcion(product.descripcion || '');
    setPrecio(Number(product.precio));
    setStock(product.stock);
    setCategoryId(product.categoryId ? String(product.categoryId) : '');
    setImageUrl(product.imageUrl || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // 5. Enviar formulario (Crear o Editar)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    if (!nombre || precio <= 0 || stock < 0) {
      setFormError('Verifica que el nombre, precio y stock sean válidos.');
      setFormSubmitting(false);
      return;
    }

    try {
      const isEditing = !!editingProduct;
      const url = isEditing 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}` 
        : `${API_BASE_URL}/api/products`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const bodyData = {
        nombre,
        descripcion,
        precio: Number(precio),
        stock: Number(stock),
        categoryId: categoryId ? Number(categoryId) : null,
        imageUrl
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar el producto');
      }

      // Actualizar estado local
      if (isEditing) {
        setProducts(products.map(p => p.id === editingProduct.id ? data : p));
      } else {
        setProducts([data, ...products]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error en la solicitud');
    } finally {
      setFormSubmitting(false);
    }
  };

  // 6. Eliminar producto
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar el producto');
      }

      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  if (!user || loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-slate-400 text-sm">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Panel de Administración</h1>
            <p className="text-slate-400 text-sm mt-1">Gestión del catálogo del Marketplace</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-teal-400 hover:bg-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/10 transition-all flex items-center gap-2"
          >
            <span>➕</span> Agregar Producto
          </button>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products List Table */}
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-850 border-b border-slate-850 text-slate-350 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Producto</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Precio</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No hay productos registrados en el sistema.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="py-4 px-6 flex items-center space-x-3">
                        <div className="h-10 w-10 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <span className="font-semibold text-white truncate max-w-xs">{product.nombre}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-teal-400 border border-teal-500/10">
                          {product.category?.nombre || 'Ninguna'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-teal-300">
                        S/ {Number(product.precio).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {product.stock} unids.
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 rounded-md text-xs font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-md text-xs font-medium border border-red-900/40 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal (Create / Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-950/50 border border-red-800 text-red-200 text-sm px-4 py-2.5 rounded-lg">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder="Ej. Teclado Mecánico RGB"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder="Detalles sobre el producto..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Precio (S/) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={precio || ''}
                      onChange={(e) => setPrecio(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Stock Inicial *
                    </label>
                    <input
                      type="number"
                      required
                      value={stock === 0 ? '0' : stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Categoría
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">Ninguna</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      URL de Imagen
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-850 border border-slate-750 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Modal actions */}
                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-slate-950 font-bold rounded-lg text-sm shadow-md shadow-teal-500/10 disabled:opacity-50 transition-colors"
                  >
                    {formSubmitting ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
