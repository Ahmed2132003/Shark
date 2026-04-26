const MOCK_DELAY = 500;

let productIdCounter = 4;
let mockProducts = [
  {
    id: 1,
    name: 'Premium Coffee Beans',
    price: 19.99,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: 2,
    name: 'Ceramic Mug',
    price: 12.5,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: 3,
    name: 'French Press',
    price: 34,
    stock: 17,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=120&h=120&q=80',
  },
];

function delay(result, shouldReject = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) {
        reject(result);
        return;
      }

      resolve(result);
    }, MOCK_DELAY);
  });
}

function normalizeProductPayload(payload) {
  return {
    name: payload.name.trim(),
    price: Number(payload.price),
    stock: Number(payload.stock),
    imageUrl: payload.imageUrl || '',
  };
}

export async function getProducts() {
  return delay([...mockProducts]);
}

export async function createProduct(payload) {
  const product = {
    id: productIdCounter,
    ...normalizeProductPayload(payload),
  };

  productIdCounter += 1;
  mockProducts = [product, ...mockProducts];

  return delay(product);
}

export async function updateProduct(productId, payload) {
  const existing = mockProducts.find((product) => product.id === productId);

  if (!existing) {
    return delay(new Error('Product not found.'), true);
  }

  const updatedProduct = {
    ...existing,
    ...normalizeProductPayload(payload),
  };

  mockProducts = mockProducts.map((product) =>
    product.id === productId ? updatedProduct : product,
  );

  return delay(updatedProduct);
}

export async function deleteProduct(productId) {
  const exists = mockProducts.some((product) => product.id === productId);

  if (!exists) {
    return delay(new Error('Product not found.'), true);
  }

  mockProducts = mockProducts.filter((product) => product.id !== productId);

  return delay({ success: true });
}

export async function uploadProductImage(file) {
  if (!file) {
    return delay(new Error('Missing image file.'), true);
  }

  return delay({
    imageUrl: URL.createObjectURL(file),
    fileName: file.name,
  });
}