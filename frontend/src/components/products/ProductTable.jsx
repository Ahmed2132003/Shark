const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function ProductTableSkeleton() {
  return (
    <div className="product-table__loading" aria-live="polite">
      Loading products...
    </div>
  );
}

function EmptyProductsState({ onAddProduct }) {
  return (
    <div className="product-table__empty" role="status">
      <p>No products found. Add your first product to get started.</p>
      <button type="button" onClick={onAddProduct}>Add Product</button>
    </div>
  );
}

export default function ProductTable({ products, loading, onAddProduct, onEditProduct, onDeleteProduct }) {
  if (loading) {
    return <ProductTableSkeleton />;
  }

  if (!products.length) {
    return <EmptyProductsState onAddProduct={onAddProduct} />;
  }

  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <img
                  className="product-table__image"
                  src={product.imageUrl || 'https://placehold.co/80x80?text=No+Image'}
                  alt={product.name}
                />
              </td>
              <td>{product.name}</td>
              <td>{currencyFormatter.format(product.price)}</td>
              <td>{product.stock}</td>
              <td>{product.hasVariants ? 'Variants' : 'Simple'}</td>
              <td>
                <div className="product-table__actions">
                  <button type="button" onClick={() => onEditProduct(product)}>Edit</button>
                  <button type="button" className="danger" onClick={() => onDeleteProduct(product)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}