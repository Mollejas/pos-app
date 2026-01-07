export interface Product {
  code: string;
  description: string;
  price: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Sale {
  folio: number;
  date: string;
  customerId: string;
  total: number;
}

export interface SaleDetail {
  folio: number;
  productCode: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface User {
  email: string;
  password?: string; // Optional for client-side usage if needed, but strict for storage
  role: 'admin' | 'user';
  numeroalmacen: string;
}
