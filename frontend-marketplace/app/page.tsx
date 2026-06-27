'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Category } from '@/types/product';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cargar categorías
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Cargar productos filtrados o todos
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URL}/api/products`;
        if (selectedCategory !== null) {
          url += `?categoryId=${selectedCategory}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Fallo al obtener productos del servidor');
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Encuentra los mejores productos en <span className="text-teal-400">Marketplace</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400">
            Descubre tecnología de punta, gadgets y accesorios al mejor precio con envíos a todo el país.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-300 mb-4">Filtrar por Categorías</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-lg shadow-teal-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-lg shadow-teal-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {category.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            <p className="mt-4 text-slate-400 text-sm">Cargando catálogo...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-lg border border-red-500/20 p-6 max-w-xl mx-auto">
            <p className="text-red-400 font-semibold mb-2">Error de conexión</p>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <button 
              onClick={() => setSelectedCategory(selectedCategory)} // Forzar recarga
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-lg border border-slate-800">
            <p className="text-slate-400">No se encontraron productos disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                href={`/products/${product.id}`} 
                key={product.id}
                className="group flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-800 flex items-center justify-center">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={product.imageUrl} 
                      alt={product.nombre}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">📦</span>
                  )}
                  {product.category && (
                    <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-teal-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-teal-500/10">
                      {product.category.nombre}
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                    {product.nombre}
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2 flex-grow">
                    {product.descripcion || 'Sin descripción disponible.'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80">
                    <span className="text-xl font-extrabold text-teal-300">
                      S/ {Number(product.precio).toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${
                      product.stock > 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {product.stock > 0 ? `${product.stock} disp.` : 'Agotado'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
