import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../../components/dashboard/StatsCard';
import ProductTable from '../../components/products/ProductTable';
import ProductFormModal from '../../components/products/ProductFormModal';
import { getDashboardOverview } from '../../services/dashboardService';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  uploadProductImage,
} from '../../services/productService';
import './dashboard.css';

function StatsCardSkeleton() {
  return (
    <article className="stats-card stats-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton-icon" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-value" />
      <div className="skeleton skeleton-change" />
    </article>
  );
}

export default function Dashboard() {
  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-dashboard-overview'],
    queryFn: () => getDashboardOverview(),
    retry: 1,
  });

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [activeProduct, setActiveProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError('');

      try {
        const response = await getProducts();
        if (!mounted) {
          return;
        }

        setProducts(response);
      } catch (productsRequestError) {
        if (mounted) {
          setProductsError(productsRequestError instanceof Error ? productsRequestError.message : 'Unable to load products.');
        }
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setActiveProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setActiveProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
  };

  const handleSubmitProduct = async (payload) => {
    setIsSubmitting(true);

    try {
      if (modalMode === 'edit' && activeProduct) {
        const updated = await updateProduct(activeProduct.id, payload);
        setProducts((prev) => prev.map((product) => (product.id === updated.id ? updated : product)));
        setFeedback({ type: 'success', message: 'Product updated successfully.' });
      } else {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        setFeedback({ type: 'success', message: 'Product created successfully.' });
      }

      setIsModalOpen(false);
    } catch (submitError) {
      setFeedback({
        type: 'error',
        message: submitError instanceof Error ? submitError.message : 'Unable to save product.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const approved = window.confirm(`Delete ${product.name}? This action cannot be undone.`);

    if (!approved) {
      return;
    }

    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setFeedback({ type: 'success', message: 'Product deleted successfully.' });
    } catch (deleteError) {
      setFeedback({
        type: 'error',
        message: deleteError instanceof Error ? deleteError.message : 'Unable to delete product.',
      });
    }
  };

  const handleImageUpload = async (file) => {
    try {
      return await uploadProductImage(file);
    } catch (uploadError) {
      setFeedback({
        type: 'error',
        message: uploadError instanceof Error ? uploadError.message : 'Unable to upload image.',
      });

      return null;
    }
  };

  return (
    <section className="admin-dashboard-overview">
      <header className="admin-dashboard-overview__header">
        <h1>Dashboard Overview</h1>
        <p>Live admin snapshot for sales, orders, customers, and catalog performance.</p>
      </header>

      {isLoading && (
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="dashboard-error" role="alert">
          <p>{error instanceof Error ? error.message : 'Something went wrong.'}</p>
          <button type="button" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {!isLoading && !isError && overview && (
        <div className="stats-grid">
          {overview.stats.map((stat) => (
            <StatsCard key={stat.key} {...stat} icon={stat.key} />
          ))}
        </div>
      )}

      <section className="products-management">
        <header className="products-management__header">
          <div>
            <h2>Products Management</h2>
            <p>Manage catalog items, stock availability, and product pricing.</p>
          </div>
          <button type="button" onClick={openAddModal}>Add Product</button>
        </header>

        {feedback && (
          <div className={`products-feedback is-${feedback.type}`} role="status">
            {feedback.message}
          </div>
        )}

        {productsError && (
          <div className="dashboard-error" role="alert">
            <p>{productsError}</p>
          </div>
        )}

        {!productsError && (
          <ProductTable
            products={sortedProducts}
            loading={productsLoading}
            onAddProduct={openAddModal}
            onEditProduct={openEditModal}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
      </section>

      {isModalOpen && (
        <ProductFormModal
          key={`${modalMode}-${activeProduct?.id ?? 'new'}`}
          isOpen={isModalOpen}
          mode={modalMode}
          initialProduct={activeProduct}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSubmit={handleSubmitProduct}
          onImageUpload={handleImageUpload}
        />
      )}
    </section>
  );
}