'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types/product';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          cache: 'no-store' // No almacenar en caché según requerimiento 3.6
        });
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Producto no encontrado');
          }
          throw new Error('Error al obtener los detalles del producto');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        <p className="mt-4 text-slate-400 text-sm">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 py-16 px-4">
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-red-500/20 p-8 max-w-md w-full">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-red-400 font-bold text-lg mb-2">Error</p>
          <p className="text-slate-400 text-sm mb-6">{error || 'El producto solicitado no existe.'}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-teal-400 hover:text-teal-300 font-medium text-sm mb-8 transition-colors"
        >
          ← Volver al Catálogo
        </Link>

        {/* Product Details Card */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          {/* Product Image Panel */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 flex items-center justify-center">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={product.imageUrl} 
                alt={product.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-9xl">📦</span>
            )}
            {product.category && (
              <span className="absolute top-4 left-4 bg-teal-500 text-slate-950 text-xs px-3.5 py-1 rounded-full font-bold tracking-wider uppercase border border-teal-400/20 shadow-lg shadow-teal-500/10">
                {product.category.nombre}
              </span>
            )}
          </div>

          {/* Product Info Panel */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                {product.nombre}
              </h1>
              
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-teal-300">
                  S/ {Number(product.precio).toFixed(2)}
                </span>
              </div>

              <div className="mt-6 border-t border-b border-slate-850 py-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Descripción del Producto
                </h3>
                <p className="mt-3 text-slate-450 leading-relaxed text-sm">
                  {product.descripcion || 'Este producto no cuenta con una descripción detallada por el momento.'}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {/* Stock status indicator */}
              <div className="flex items-center space-x-3 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  product.stock > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}></span>
                <span className={product.stock > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {product.stock > 0 ? `En Stock: ${product.stock} unidades disponibles` : 'Temporalmente Agotado'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  disabled={product.stock <= 0}
                  className="flex-grow py-3 bg-teal-400 hover:bg-teal-500 text-slate-950 font-bold rounded-xl text-center shadow-lg shadow-teal-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
