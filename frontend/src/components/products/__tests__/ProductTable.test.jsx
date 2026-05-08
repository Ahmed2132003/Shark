import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductTable from '../ProductTable';

describe('ProductTable', () => {
  const products = [{ id: 1, name: 'A', price: 10, stock: 3, hasVariants: false, imageUrl: '' }];
  it('renders rows from props', () => {
    render(<ProductTable products={products} onEditProduct={vi.fn()} onDeleteProduct={vi.fn()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});