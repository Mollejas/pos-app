import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';
import { Product, Customer, Sale, SaleDetail, User } from './types';

// Configuración de autenticación (OAuth 2.0)
const getAuth = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Credenciales de Google OAuth no configuradas en .env.local');
  }

  const client = new OAuth2Client(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
};

const getDoc = async () => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID no configurado en .env.local');
  }

  const auth = getAuth();
  // @ts-ignore: google-spreadsheet types for OAuth2Client are slightly different but compatible
  const doc = new GoogleSpreadsheet(sheetId, auth);
  await doc.loadInfo();
  return doc;
};

export const initializeSheets = async () => {
  try {
    const doc = await getDoc();
    
    const requiredSheets = ['Productos', 'Clientes', 'Ventas', 'DetalleVentas', 'Config', 'Usuarios'];
    
    for (const title of requiredSheets) {
      if (!doc.sheetsByTitle[title]) {
        let headerValues: string[] = [];
        switch (title) {
          case 'Productos':
            headerValues = ['code', 'description', 'price', 'image'];
            break;
          case 'Clientes':
            headerValues = ['id', 'name', 'email', 'phone'];
            break;
          case 'Ventas':
            headerValues = ['folio', 'date', 'customerId', 'total'];
            break;
          case 'DetalleVentas':
            headerValues = ['folio', 'productCode', 'quantity', 'price', 'subtotal'];
            break;
          case 'Config':
            headerValues = ['key', 'value'];
            break;
          case 'Usuarios':
            headerValues = ['email', 'password', 'role', 'numeroalmacen'];
            break;
        }
        await doc.addSheet({ title, headerValues });
        
        // Inicializar folio si es Config
        if (title === 'Config') {
          const sheet = doc.sheetsByTitle['Config'];
          await sheet.addRow({ key: 'last_folio', value: '0' });
        }

        // Inicializar usuario default
        if (title === 'Usuarios') {
          const sheet = doc.sheetsByTitle['Usuarios'];
          await sheet.addRow({
            email: 'ingmts@hotmail.com',
            password: 'Mollejas86', // En producción, esto debería estar hasheado
            role: 'admin',
            numeroalmacen: '1'
          });
        }
      } else if (title === 'Productos') {
        // Asegurar que exista la columna image en productos existentes
        const sheet = doc.sheetsByTitle['Productos'];
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        if (!headers.includes('image')) {
          const newHeaders = [...headers, 'image'];
          await sheet.setHeaderRow(newHeaders);
        }
      }
    }

    // Ensure admin user exists even if sheet existed
    const usersSheet = doc.sheetsByTitle['Usuarios'];
    if (usersSheet) {
      const rows = await usersSheet.getRows();
      // Simple check: if empty or no admin found (checking empty is safer/faster first step)
      if (rows.length === 0) {
         await usersSheet.addRow({
            email: 'ingmts@hotmail.com',
            password: 'Mollejas86',
            role: 'admin',
            numeroalmacen: '1'
         });
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing sheets:', error);
    return false;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Productos'];
  
  // Auto-repair headers if image is missing
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  if (!headers.includes('image')) {
    const newHeaders = [...headers, 'image'];
    await sheet.setHeaderRow(newHeaders);
  }

  const rows = await sheet.getRows();
  return rows.map(row => ({
    code: row.get('code'),
    description: row.get('description'),
    price: parseFloat(row.get('price')),
    image: row.get('image') || '',
  }));
};

export const addProduct = async (product: Product) => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Productos'];
  // Check if exists
  const rows = await sheet.getRows();
  const existing = rows.find(r => r.get('code') === product.code);
  if (existing) {
    throw new Error('El producto ya existe');
  }
  await sheet.addRow({
    code: product.code,
    description: product.description,
    price: product.price.toString(),
    image: product.image || ''
  });
};

export const updateProduct = async (code: string, updatedProduct: Partial<Product>) => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Productos'];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('codigo') === code);
  
  if (row) {
    if (updatedProduct.description) row.set('descripcion', updatedProduct.description);
    if (updatedProduct.price) row.set('precio', updatedProduct.price);
    if (updatedProduct.image !== undefined) row.set('imagen', updatedProduct.image);
    await row.save();
  } else {
    throw new Error('Producto no encontrado');
  }
};

export const getCustomers = async (): Promise<Customer[]> => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Clientes'];
  const rows = await sheet.getRows();
  return rows.map(row => ({
    id: row.get('id'),
    name: row.get('name'),
    email: row.get('email'),
    phone: row.get('phone'),
  }));
};

export const addCustomer = async (customer: Customer) => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Clientes'];
  await sheet.addRow({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone
  });
};

export const getNextFolio = async (): Promise<number> => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Config'];
  const rows = await sheet.getRows();
  const folioRow = rows.find(r => r.get('key') === 'last_folio');
  
  if (folioRow) {
    const current = parseInt(folioRow.get('value'));
    const next = current + 1;
    folioRow.set('value', next.toString());
    await folioRow.save();
    return next;
  } else {
    await sheet.addRow({ key: 'last_folio', value: '1' });
    return 1;
  }
};

export const createSale = async (sale: Omit<Sale, 'folio'>, details: Omit<SaleDetail, 'folio'>[]) => {
  const folio = await getNextFolio();
  
  const doc = await getDoc();
  const salesSheet = doc.sheetsByTitle['Ventas'];
  const detailsSheet = doc.sheetsByTitle['DetalleVentas'];
  
  await salesSheet.addRow({
    folio: folio.toString(),
    date: sale.date,
    customerId: sale.customerId,
    total: sale.total.toString()
  });
  
  const detailRows = details.map(d => ({
    folio: folio.toString(),
    productCode: d.productCode,
    quantity: d.quantity.toString(),
    price: d.price.toString(),
    subtotal: d.subtotal.toString()
  }));
  
  await detailsSheet.addRows(detailRows);
  
  return folio;
};

export const getUsers = async (): Promise<User[]> => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];
  const rows = await sheet.getRows();
  return rows.map(row => ({
    email: row.get('email'),
    password: row.get('password'),
    role: row.get('role') as 'admin' | 'user',
    numeroalmacen: row.get('numeroalmacen')
  }));
};

export const addUser = async (user: User) => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];
  
  // Check if exists
  const rows = await sheet.getRows();
  const existing = rows.find(r => r.get('email') === user.email);
  if (existing) {
    throw new Error('El usuario ya existe');
  }

  await sheet.addRow({
    email: user.email,
    password: user.password || '',
    role: user.role,
    numeroalmacen: user.numeroalmacen
  });
};

export const updateUser = async (email: string, updatedUser: Partial<User>) => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('email') === email);
  
  if (row) {
    if (updatedUser.email) row.set('email', updatedUser.email);
    if (updatedUser.password) row.set('password', updatedUser.password);
    if (updatedUser.role) row.set('role', updatedUser.role);
    if (updatedUser.numeroalmacen) row.set('numeroalmacen', updatedUser.numeroalmacen);
    await row.save();
  } else {
    throw new Error('Usuario no encontrado');
  }
};

export const deleteUser = async (email: string) => {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle['Usuarios'];
  const rows = await sheet.getRows();
  const row = rows.find(r => r.get('email') === email);
  
  if (row) {
    await row.delete();
  } else {
    throw new Error('Usuario no encontrado');
  }
};
