import { useQuery } from '@tanstack/react-query';
import { fetchInvoiceById, fetchInvoices } from '../services/invoiceService';

export function useInvoices() {
  return useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });
}

export function useInvoice(id) {
  return useQuery({ queryKey: ['invoice', id], queryFn: () => fetchInvoiceById(id), enabled: Boolean(id) });
}