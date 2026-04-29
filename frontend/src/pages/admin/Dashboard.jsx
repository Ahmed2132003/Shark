import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../../components/dashboard/StatsCard';
import ProductTable from '../../components/products/ProductTable';
import ProductFormModal from '../../components/products/ProductFormModal';
import { getDashboardOverview } from '../../services/dashboardService';
import { createProduct, deleteProduct, getProductCategories, getProducts, updateProduct, uploadProductImage, createCategory, updateCategory, deleteCategory as removeCategory } from '../../services/productService';
import './dashboard.css';

function StatsCardSkeleton() {
  return <article className="stats-card stats-card--skeleton" aria-hidden="true"><div className="skeleton skeleton-icon" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-value" /><div className="skeleton skeleton-change" /></article>;
}

export default function Dashboard() {
  const { data: overview, isLoading, isError, error, refetch } = useQuery({ queryKey: ['admin-dashboard-overview'], queryFn: () => getDashboardOverview(), retry: 1 });
  const { refetch: refetchCategories, data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({ queryKey: ['admin-product-categories'], queryFn: () => getProductCategories(), retry: 1 });
  const [feedback, setFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [activeProduct, setActiveProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const { data: products = [], isLoading: productsLoading, isError: productsQueryError, error: productsError, refetch: refetchProducts } = useQuery({ queryKey: ['admin-products'], queryFn: () => getProducts(), retry: 1 });
  const sortedProducts = useMemo(() => [...products].sort((a, b) => a.name.localeCompare(b.name)), [products]);

  const openAddModal = () => { setModalMode('add'); setActiveProduct(null); setIsModalOpen(true); };
  const openEditModal = (product) => { setModalMode('edit'); setActiveProduct(product); setIsModalOpen(true); };
  const closeModal = () => { if (!isSubmitting) setIsModalOpen(false); };

  const handleAddCategory = async () => { if (!categoryName.trim()) return; await createCategory({ name: categoryName.trim(), is_active: true }); setCategoryName(''); await refetchCategories(); };
  const handleEditCategory = async (category) => { const name = window.prompt('Category name', category.name); if (!name) return; await updateCategory(category.id, { name }); await refetchCategories(); };
  const handleDeleteCategory = async (category) => { if (!window.confirm(`Delete category ${category.name}?`)) return; await removeCategory(category.id); await refetchCategories(); };

  const handleSubmitProduct = async (payload) => {
    setIsSubmitting(true);
    try {
      const savedProduct = (modalMode === 'edit' && activeProduct) ? await updateProduct(activeProduct.id, payload) : await createProduct(payload);
      if (payload.imageFile) await uploadProductImage(savedProduct.id, payload.imageFile);
      await refetchProducts();
      setFeedback({ type: 'success', message: modalMode === 'edit' ? 'Product updated successfully.' : 'Product created successfully.' });
      setIsModalOpen(false);
    } catch (submitError) {
      setFeedback({ type: 'error', message: submitError instanceof Error ? submitError.message : 'Unable to save product.' });
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This action cannot be undone.`)) return;
    try { await deleteProduct(product.id); await refetchProducts(); setFeedback({ type: 'success', message: 'Product deleted successfully.' }); }
    catch (deleteError) { setFeedback({ type: 'error', message: deleteError instanceof Error ? deleteError.message : 'Unable to delete product.' }); }
  };

  return (<section className="admin-dashboard-overview"><header className="admin-dashboard-overview__header"><div><h1>Dashboard Overview</h1><p>Live admin snapshot for sales, orders, customers, and catalog performance.</p></div><Link to="/dashboard/orders" className="admin-dashboard-overview__orders-link">Go to Orders Management</Link></header>
    {isLoading && <div className="stats-grid">{Array.from({ length: 4 }).map((_, index) => <StatsCardSkeleton key={index} />)}</div>}
    {!isLoading && isError && <div className="dashboard-error" role="alert"><p>{error instanceof Error ? error.message : 'Something went wrong.'}</p><button type="button" onClick={() => refetch()}>Retry</button></div>}
    {!isLoading && !isError && overview && <div className="stats-grid">{overview.stats.map((stat) => <StatsCard key={stat.key} title={stat.title} value={stat.value} change={stat.change} trend={stat.trend} icon={stat.key} />)}</div>}

    <section className="products-management"><header className="products-management__header"><div><h2>Categories Management</h2><p>Create/edit categories used by product form.</p></div><div style={{ display: 'flex', gap: 8 }}><input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" className="orders-input" /><button type="button" onClick={handleAddCategory}>Add Category</button></div></header><div className="orders-surface">{(categories || []).map((cat) => <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span>{cat.name}</span><span><button type="button" className="orders-link" onClick={() => handleEditCategory(cat)}>Edit</button> <button type="button" className="orders-link" onClick={() => handleDeleteCategory(cat)}>Delete</button></span></div>)}</div></section>

    <section className="products-management"><header className="products-management__header"><div><h2>Products Management</h2><p>Manage catalog items, stock availability, and product pricing.</p></div><button type="button" onClick={openAddModal}>Add Product</button></header>
      {feedback && <div className={`products-feedback is-${feedback.type}`} role="status">{feedback.message}</div>}
      {(productsQueryError || categoriesError) && <div className="dashboard-error" role="alert"><p>{(productsError instanceof Error ? productsError.message : '') || 'Unable to load categories.'}</p></div>}
      {!productsQueryError && <ProductTable products={sortedProducts} loading={productsLoading} onAddProduct={openAddModal} onEditProduct={openEditModal} onDeleteProduct={handleDeleteProduct} />}
    </section>

    {isModalOpen && <ProductFormModal key={`${modalMode}-${activeProduct?.id ?? 'new'}`} isOpen={isModalOpen} mode={modalMode} categories={categories} categoriesLoading={categoriesLoading} initialProduct={activeProduct} isSubmitting={isSubmitting} onClose={closeModal} onSubmit={handleSubmitProduct} />}
  </section>);
}