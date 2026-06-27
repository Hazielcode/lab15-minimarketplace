export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoryId?: number | null;
  imageUrl?: string;
  category?: Category | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
