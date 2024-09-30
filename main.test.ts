import {} from './main_shop';
import { setupDatabase, getProducts, getOrders } from './main_shop';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db: any;

beforeAll(async () => {
  db = await open({
    filename: ':memory:',  // Usando um banco de dados na memória para testes
    driver: sqlite3.Database,
  });

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
});

afterAll(async () => {
  await db.close();
});

test('should store and retrieve products correctly', async () => {
  // Inserir um produto de exemplo
  await db.run('INSERT INTO products (platform_id, name) VALUES (?, ?)', '123', 'Test Product');
  
  const products = await getProducts(db);
  expect(products.length).toBe(1);
  expect(products[0]).toEqual({
    id: '1',
    platform_id: '123',
    name: 'Test Product'
  });
});

test('should store and retrieve orders with line items', async () => {
  // Inserir um pedido e um line_item de exemplo
  await db.run('INSERT INTO orders (platform_id) VALUES (?)', '12345');
  await db.run('INSERT INTO line_items (order_id, product_id) VALUES (?, ?)', 1, 1);

  const orders = await getOrders(db);
  expect(orders.length).toBe(1);
  expect(orders[0].line_items.length).toBe(1);
  expect(orders[0].line_items[0].product_id).toBe('123');
});
