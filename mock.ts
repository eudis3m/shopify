import axios from 'axios';
import  {fetchAndStoreProducts,setupDatabase} from './main_shop';

jest.mock('axios');

test('should fetch and store products from Shopify', async () => {
  const mockedResponse = {
    data: {
      products: [
        { id: '123', title: 'Product A' },
        { id: '456', title: 'Product B' }
      ]
    }
  };
  
  (axios.get as jest.Mock).mockResolvedValue(mockedResponse);

  const db = await setupDatabase(); // Setup the in-memory database
  await fetchAndStoreProducts(db);

  const products = await db.all('SELECT * FROM products');
  expect(products.length).toBe(2);
  expect(products[0].platform_id).toBe('123');
});
