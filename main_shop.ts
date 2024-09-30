import  axios from 'axios';
//import sqlite3 from 'sqlite3';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Constantes da API
const SHOPIFY_API_URL = 'https://3e58bf-fd.myshopify.com/admin/api/2024-07/graphql.json';
const SHOPIFY_ACCESS_TOKEN = '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';

const headers = {
  'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
};

// Tipos
type Product = {
  id: string;
  platform_id: string;
  name: string;
};

type LineItem = {
  product_id: string | null;
};

type Order = {
  id: string;
  platform_id: string;
  line_items: LineItem[];
};

// Conectar ao banco de dados SQLite
export async function setupDatabase() {
  const db = await open({
    filename: 'shopify.db',
    driver: sqlite3.Database,
  });

  // Criar tabelas de produtos e pedidos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform_id TEXT UNIQUE NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS line_items (
      order_id INTEGER,
      product_id INTEGER,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  return db;
}

// Função para buscar dados paginados da API do Shopify
export async function fetchPaginatedData(endpoint: string, limit: number = 50): Promise<any[]> {
  let url = `${SHOPIFY_API_URL}/${endpoint}.json`;
  let data: any[] = [];
  let hasNextPage = true;
  let params = { limit };

  while (hasNextPage) {
    const response = await axios.get(url, { headers, params });
    data = data.concat(response.data[endpoint]);

    // Verificar se há uma próxima página
    const nextLink = response.headers.link?.match(/<(.*?)>; rel="next"/);
    hasNextPage = !!nextLink;
    url = nextLink ? nextLink[1] : '';
  }

  return data;
}

// Função para buscar e armazenar produtos no banco de dados
export async function fetchAndStoreProducts(db: any) {
  const products = await fetchPaginatedData('products');
  
  for (const product of products) {
    const platform_id = product.id;
    const name = product.title;

    await db.run('INSERT OR IGNORE INTO products (platform_id, name) VALUES (?, ?)', platform_id, name);
  }
}

// Função para buscar e armazenar pedidos no banco de dados
export async function fetchAndStoreOrders(db: any) {
  const orders = await fetchPaginatedData('orders');
  
  for (const order of orders) {
    const platform_id = order.id;

    await db.run('INSERT OR IGNORE INTO orders (platform_id) VALUES (?)', platform_id);
    const orderId = (await db.get('SELECT id FROM orders WHERE platform_id = ?', platform_id)).id;

    // Processar line_items
    for (const item of order.line_items) {
      const productId = item.product_id;

      if (productId) {
        const productDb = await db.get('SELECT id FROM products WHERE platform_id = ?', productId);
        const productDbId = productDb ? productDb.id : null;

        // Inserir line_item
        await db.run('INSERT INTO line_items (order_id, product_id) VALUES (?, ?)', orderId, productDbId);
      }
    }
  }
}

// Função para buscar todos os produtos
export async function getProducts(db: any): Promise<Product[]> {
  const products = await db.all('SELECT id, platform_id, name FROM products');
  
  return products.map((p: any) => ({
    id: String(p.id),
    platform_id: p.platform_id,
    name: p.name,
  }));
}

// Função para buscar todos os pedidos
export async function getOrders(db: any): Promise<Order[]> {
  const orders = await db.all('SELECT id, platform_id FROM orders');
  
  const result: Order[] = [];

  for (const order of orders) {
    const lineItems = await db.all('SELECT product_id FROM line_items WHERE order_id = ?', order.id);
    
    const formattedLineItems: LineItem[] = await Promise.all(
      lineItems.map(async (item: any) => {
        const productId = item.product_id;
        if (productId) {
          const product = await db.get('SELECT platform_id FROM products WHERE id = ?', productId);
          return { product_id: product ? String(product.platform_id) : null };
        } else {
          return { product_id: null };
        }
      })
    );

    result.push({
      id: String(order.id),
      platform_id: order.platform_id,
      line_items: formattedLineItems,
    });
  }

  return result;
}

// Função principal para rodar o código
export async function main() {
  const db = await setupDatabase();

  // Buscar e armazenar produtos e pedidos
  await fetchAndStoreProducts(db);
  await fetchAndStoreOrders(db);

  // Buscar e exibir produtos e pedidos formatados
  const products = await getProducts(db);
  console.log('Products:', products);

  const orders = await getOrders(db);
  console.log('Orders:', orders);
}

main().catch(console.error);
