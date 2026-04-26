import { useMemo, useState } from 'react';

const defaultFormValues = {
  name: '',
  price: '',
  stock: '',
  imageUrl: '',
};

function FormField({ label, id, error, children }) {
  return (
    <label className="product-modal__field" htmlFor={id}>
      <span>{label}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

function getInitialValues(initialProduct) {
  if (!initialProduct) {
    return defaultFormValues;
  }

  return {
    name: initialProduct.name,
    price: String(initialProduct.price),
    stock: String(initialProduct.stock),
    imageUrl: initialProduct.imageUrl || '',
  };
}

function validateForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (values.price === '' || Number(values.price) < 0) {
    errors.price = 'Price must be 0 or greater.';
  }

  if (values.stock === '' || Number(values.stock) < 0 || !Number.isInteger(Number(values.stock))) {
    errors.stock = 'Stock must be a whole number 0 or greater.';
  }

  return errors;
}

export default function ProductFormModal({
  isOpen,
  mode,
  initialProduct,
  isSubmitting,
  onClose,
  onSubmit,
  onImageUpload,
}) {
  const [values, setValues] = useState(() => getInitialValues(initialProduct));
  const [errors, setErrors] = useState({});
  const [imageFileName, setImageFileName] = useState('');

  const title = useMemo(() => (mode === 'edit' ? 'Edit Product' : 'Add Product'), [mode]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit(values);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const result = await onImageUpload(file);

    if (result?.imageUrl) {
      handleChange('imageUrl', result.imageUrl);
      setImageFileName(result.fileName || file.name);
    }
  };

  return (
    <div className="product-modal__overlay" role="presentation" onClick={onClose}>
      <div className="product-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <header className="product-modal__header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close modal">×</button>
        </header>

        <form className="product-modal__form" onSubmit={handleSubmit}>
          <FormField label="Product Name" id="product-name" error={errors.name}>
            <input
              id="product-name"
              type="text"
              value={values.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder="Enter product name"
            />
          </FormField>

          <div className="product-modal__row">
            <FormField label="Price" id="product-price" error={errors.price}>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(event) => handleChange('price', event.target.value)}
              />
            </FormField>

            <FormField label="Stock" id="product-stock" error={errors.stock}>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={values.stock}
                onChange={(event) => handleChange('stock', event.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Image URL" id="product-image-url">
            <input
              id="product-image-url"
              type="url"
              value={values.imageUrl}
              onChange={(event) => handleChange('imageUrl', event.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </FormField>

          <FormField label="Upload Image (Mock)" id="product-image-upload">
            <input
              id="product-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageFileName && <small className="product-modal__hint">Uploaded: {imageFileName}</small>}
          </FormField>

          <footer className="product-modal__footer">
            <button type="button" className="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Product'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}