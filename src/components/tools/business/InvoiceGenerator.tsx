'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AnimatedElement from '@/components/animated-element';
import DOMPurify from 'dompurify';
import {
    Plus, Trash2, Download, FileText, Save, Upload, Send, Eye, EyeOff,
    DollarSign, Percent, Calendar, Building2, User, Mail, MapPin,
    Phone, Globe, CreditCard, Printer, Copy, Check, Settings,
    Calculator, FileSpreadsheet, Receipt, Clock, Repeat, Palette,
    Image as ImageIcon, ChevronDown, ChevronUp, Star, AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    taxable: boolean;
}

interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
}

interface InvoiceData {
    // Basic Info
    invoiceNumber: string;
    date: string;
    dueDate: string;
    poNumber: string;

    // Business Info
    fromName: string;
    fromEmail: string;
    fromPhone: string;
    fromAddress: string;
    fromTaxId: string;
    fromWebsite: string;
    logoUrl: string;

    // Client Info
    toName: string;
    toEmail: string;
    toPhone: string;
    toAddress: string;
    toTaxId: string;

    // Items & Pricing
    items: InvoiceItem[];
    currency: string;
    taxRate: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    shippingCost: number;

    // Payment
    paymentTerms: string;
    paymentMethods: string[];
    bankDetails: string;
    paymentInstructions: string;

    // Additional
    notes: string;
    terms: string;
    footer: string;

    // Status & Tracking
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    payments: PaymentRecord[];

    // Settings
    showLogo: boolean;
    accentColor: string;
    template: 'professional' | 'modern' | 'classic' | 'minimal' | 'creative';

    // Recurring
    isRecurring: boolean;
    recurringFrequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const EnhancedInvoiceGenerator: React.FC = () => {
    const [invoice, setInvoice] = useState<InvoiceData>({
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        poNumber: '',
        fromName: '',
        fromEmail: '',
        fromPhone: '',
        fromAddress: '',
        fromTaxId: '',
        fromWebsite: '',
        logoUrl: '',
        toName: '',
        toEmail: '',
        toPhone: '',
        toAddress: '',
        toTaxId: '',
        items: [{ id: '1', description: '', quantity: 1, rate: 0, taxable: true }],
        currency: 'USD',
        taxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shippingCost: 0,
        paymentTerms: 'Net 30',
        paymentMethods: ['Bank Transfer', 'Credit Card'],
        bankDetails: '',
        paymentInstructions: '',
        notes: '',
        terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.',
        footer: 'Thank you for your business!',
        status: 'draft',
        payments: [],
        showLogo: false,
        accentColor: '#2563eb',
        template: 'professional',
        isRecurring: false,
        recurringFrequency: 'monthly',
    });

    const [activeTab, setActiveTab] = useState('details');
    const [savedClients, setSavedClients] = useState<Client[]>([]);
    const [showPreview, setShowPreview] = useState(true);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getCurrencySymbol = () => {
        return currencies.find(c => c.code === invoice.currency)?.symbol || '$';
    };

    const updateField = (field: keyof InvoiceData, value: any) => {
        setInvoice(prev => ({ ...prev, [field]: value }));
    };

    // Item Management
    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            rate: 0,
            taxable: true,
        };
        setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (id: string) => {
        if (invoice.items.length === 1) {
            toast.error('Invoice must have at least one item');
            return;
        }
        setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const duplicateItem = (id: string) => {
        const itemToDuplicate = invoice.items.find(item => item.id === id);
        if (itemToDuplicate) {
            const newItem = { ...itemToDuplicate, id: Date.now().toString() };
            setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
            toast.success('Item duplicated');
        }
    };

    // Payment Management
    const addPayment = () => {
        const newPayment: PaymentRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            method: 'Bank Transfer',
            reference: '',
        };
        setInvoice(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    };

    const removePayment = (id: string) => {
        setInvoice(prev => ({ ...prev, payments: prev.payments.filter(p => p.id !== id) }));
    };

    const updatePayment = (id: string, field: keyof PaymentRecord, value: any) => {
        setInvoice(prev => ({
            ...prev,
            payments: prev.payments.map(payment =>
                payment.id === id ? { ...payment, [field]: value } : payment
            ),
        }));
    };

    // Calculations
    const calculateItemTotal = (item: InvoiceItem) => {
        return item.quantity * item.rate;
    };

    const calculateSubtotal = () => {
        return invoice.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        if (invoice.discountType === 'percentage') {
            return subtotal * (invoice.discountValue / 100);
        }
        return invoice.discountValue;
    };

    const calculateTaxableAmount = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const taxableItems = invoice.items
            .filter(item => item.taxable)
            .reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const taxableRatio = subtotal > 0 ? taxableItems / subtotal : 0;
        return (subtotal - discount) * taxableRatio;
    };

    const calculateTax = () => {
        return calculateTaxableAmount() * (invoice.taxRate / 100);
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateDiscount() + calculateTax() + invoice.shippingCost;
    };

    const calculateAmountPaid = () => {
        return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    };

    const calculateAmountDue = () => {
        return calculateTotal() - calculateAmountPaid();
    };

    // Client Management
    const saveClient = () => {
        const newClient: Client = {
            id: Date.now().toString(),
            name: invoice.toName,
            email: invoice.toEmail,
            phone: invoice.toPhone,
            address: invoice.toAddress,
            taxId: invoice.toTaxId,
        };
        setSavedClients(prev => [...prev, newClient]);
        toast.success('Client saved successfully');
    };

    const loadClient = (clientId: string) => {
        const client = savedClients.find(c => c.id === clientId);
        if (client) {
            setInvoice(prev => ({
                ...prev,
                toName: client.name,
                toEmail: client.email,
                toPhone: client.phone,
                toAddress: client.address,
                toTaxId: client.taxId,
            }));
            toast.success('Client details loaded');
        }
    };

    // Template Generation
    const generateInvoiceHTML = () => {
        const symbol = getCurrencySymbol();
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const tax = calculateTax();
        const total = calculateTotal();
        const amountPaid = calculateAmountPaid();
        const amountDue = calculateAmountDue();

        const statusColors = {
            draft: '#6b7280',
            sent: '#3b82f6',
            paid: '#10b981',
            overdue: '#ef4444',
            cancelled: '#64748b',
        };

        const statusBadge = `<span style="background: ${statusColors[invoice.status]}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${invoice.status}</span>`;

        // Professional Template
        if (invoice.template === 'professional') {
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 50px; color: #1f2937; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid ${invoice.accentColor}; }
    .logo { max-width: 180px; max-height: 80px; }
    .company-info { text-align: left; }
    .company-name { font-size: 26px; font-weight: 700; color: ${invoice.accentColor}; margin-bottom: 8px; }
    .invoice-title-section { text-align: right; }
    .invoice-title { font-size: 42px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
    .invoice-meta { color: #6b7280; font-size: 14px; }
    .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .info-box { background: #f9fafb; padding: 24px; border-radius: 12px; border-left: 4px solid ${invoice.accentColor}; }
    .info-title { font-size: 12px; text-transform: uppercase; font-weight: 700; color: ${invoice.accentColor}; margin-bottom: 12px; letter-spacing: 1px; }
    .info-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #1f2937; }
    .info-detail { font-size: 14px; color: #4b5563; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead { background: ${invoice.accentColor}; color: white; }
    th { padding: 16px 12px; text-align: left; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    th.text-right { text-align: right; }
    td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    td.text-right { text-align: right; }
    tbody tr:hover { background: #f9fafb; }
    .item-description { font-weight: 600; color: #1f2937; }
    .summary-section { display: flex; justify-content: flex-end; margin-top: 30px; }
    .summary-box { width: 400px; background: #f9fafb; padding: 24px; border-radius: 12px; }
    .summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; }
    .summary-label { color: #6b7280; font-weight: 500; }
    .summary-value { font-weight: 600; color: #1f2937; }
    .summary-total { border-top: 3px solid ${invoice.accentColor}; padding-top: 16px; margin-top: 12px; font-size: 20px; font-weight: 700; }
    .summary-total .summary-label { color: #1f2937; }
    .summary-total .summary-value { color: ${invoice.accentColor}; }
    .amount-due { background: ${invoice.accentColor}; color: white; margin: 16px -24px -24px; padding: 20px 24px; border-radius: 0 0 12px 12px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; }
    .payment-section { background: #fef3c7; padding: 24px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #f59e0b; }
    .payment-title { font-weight: 700; margin-bottom: 12px; color: #92400e; display: flex; align-items: center; gap: 8px; }
    .payment-methods { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .payment-method { background: white; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #92400e; border: 1px solid #fbbf24; }
    .notes-section { background: #f0f9ff; padding: 24px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #3b82f6; }
    .terms-section { background: #f3f4f6; padding: 24px; border-radius: 12px; margin: 30px 0; }
    .section-title { font-weight: 700; margin-bottom: 12px; color: #1f2937; font-size: 16px; }
    .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; }
    .payments-table { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 16px 0; }
    .payments-table table { margin: 0; }
    .payments-table td { padding: 10px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${invoice.showLogo && invoice.logoUrl ? `<img src="${invoice.logoUrl}" class="logo" alt="Logo">` : ''}
      <div class="company-name">${invoice.fromName || 'Your Company'}</div>
      ${invoice.fromEmail ? `<div class="info-detail">${invoice.fromEmail}</div>` : ''}
      ${invoice.fromPhone ? `<div class="info-detail">${invoice.fromPhone}</div>` : ''}
      ${invoice.fromWebsite ? `<div class="info-detail">${invoice.fromWebsite}</div>` : ''}
    </div>
    <div class="invoice-title-section">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">
        <div style="margin-bottom: 8px;">${statusBadge}</div>
        <div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>
        <div><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</div>
        <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
        ${invoice.poNumber ? `<div><strong>PO #:</strong> ${invoice.poNumber}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-box">
      <div class="info-title">From</div>
      <div class="info-name">${invoice.fromName || 'Your Company'}</div>
      ${invoice.fromAddress ? `<div class="info-detail">${invoice.fromAddress.replace(/\n/g, '<br>')}</div>` : ''}
      ${invoice.fromEmail ? `<div class="info-detail">📧 ${invoice.fromEmail}</div>` : ''}
      ${invoice.fromPhone ? `<div class="info-detail">📱 ${invoice.fromPhone}</div>` : ''}
      ${invoice.fromTaxId ? `<div class="info-detail"><strong>Tax ID:</strong> ${invoice.fromTaxId}</div>` : ''}
    </div>

    <div class="info-box">
      <div class="info-title">Bill To</div>
      <div class="info-name">${invoice.toName || 'Client Name'}</div>
      ${invoice.toAddress ? `<div class="info-detail">${invoice.toAddress.replace(/\n/g, '<br>')}</div>` : ''}
      ${invoice.toEmail ? `<div class="info-detail">📧 ${invoice.toEmail}</div>` : ''}
      ${invoice.toPhone ? `<div class="info-detail">📱 ${invoice.toPhone}</div>` : ''}
      ${invoice.toTaxId ? `<div class="info-detail"><strong>Tax ID:</strong> ${invoice.toTaxId}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Description</th>
        <th class="text-right" style="width: 15%;">Quantity</th>
        <th class="text-right" style="width: 15%;">Rate</th>
        <th class="text-right" style="width: 20%;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => `
        <tr>
          <td class="item-description">
            ${item.description || 'Item description'}
            ${!item.taxable ? '<br><span style="font-size: 11px; color: #6b7280;">Tax Exempt</span>' : ''}
          </td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">${symbol}${item.rate.toFixed(2)}</td>
          <td class="text-right">${symbol}${calculateItemTotal(item).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="summary-box">
      <div class="summary-row">
        <span class="summary-label">Subtotal:</span>
        <span class="summary-value">${symbol}${subtotal.toFixed(2)}</span>
      </div>
      
      ${invoice.discountValue > 0 ? `
      <div class="summary-row" style="color: #10b981;">
        <span class="summary-label">Discount ${invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}:</span>
        <span class="summary-value">-${symbol}${discount.toFixed(2)}</span>
      </div>
      ` : ''}
      
      ${invoice.taxRate > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Tax (${invoice.taxRate}%):</span>
        <span class="summary-value">${symbol}${tax.toFixed(2)}</span>
      </div>
      ` : ''}
      
      ${invoice.shippingCost > 0 ? `
      <div class="summary-row">
        <span class="summary-label">Shipping:</span>
        <span class="summary-value">${symbol}${invoice.shippingCost.toFixed(2)}</span>
      </div>
      ` : ''}
      
      <div class="summary-row summary-total">
        <span class="summary-label">Total:</span>
        <span class="summary-value">${symbol}${total.toFixed(2)}</span>
      </div>
      
      ${amountPaid > 0 ? `
      <div class="summary-row" style="color: #10b981; margin-top: 12px;">
        <span class="summary-label">Amount Paid:</span>
        <span class="summary-value">-${symbol}${amountPaid.toFixed(2)}</span>
      </div>
      ` : ''}
      
      ${amountDue !== total ? `
      <div class="amount-due">
        <span>Amount Due:</span>
        <span>${symbol}${amountDue.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>
  </div>

  ${invoice.payments.length > 0 ? `
  <div class="payments-table">
    <div class="section-title">Payment History</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Method</th>
          <th>Reference</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.payments.map(payment => `
          <tr>
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>${payment.method}</td>
            <td>${payment.reference || '-'}</td>
            <td class="text-right">${symbol}${payment.amount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${invoice.paymentMethods.length > 0 || invoice.bankDetails || invoice.paymentInstructions ? `
  <div class="payment-section">
    <div class="payment-title">💳 Payment Information</div>
    ${invoice.paymentMethods.length > 0 ? `
    <div style="margin-bottom: 12px;"><strong>Accepted Methods:</strong></div>
    <div class="payment-methods">
      ${invoice.paymentMethods.map(method => `<span class="payment-method">${method}</span>`).join('')}
    </div>
    ` : ''}
    ${invoice.bankDetails ? `
    <div style="margin-top: 16px;"><strong>Bank Details:</strong></div>
    <div style="white-space: pre-line; font-size: 14px; margin-top: 8px; color: #78350f;">${invoice.bankDetails}</div>
    ` : ''}
    ${invoice.paymentInstructions ? `
    <div style="margin-top: 16px;"><strong>Instructions:</strong></div>
    <div style="font-size: 14px; margin-top: 8px; color: #78350f;">${invoice.paymentInstructions}</div>
    ` : ''}
    ${invoice.paymentTerms ? `
    <div style="margin-top: 12px; font-size: 13px; color: #92400e;"><strong>Terms:</strong> ${invoice.paymentTerms}</div>
    ` : ''}
  </div>
  ` : ''}

  ${invoice.notes ? `
  <div class="notes-section">
    <div class="section-title">📝 Notes</div>
    <div style="white-space: pre-line; font-size: 14px; color: #1e40af;">${invoice.notes}</div>
  </div>
  ` : ''}

  ${invoice.terms ? `
  <div class="terms-section">
    <div class="section-title">Terms & Conditions</div>
    <div style="white-space: pre-line; font-size: 13px; color: #4b5563;">${invoice.terms}</div>
  </div>
  ` : ''}

  ${invoice.footer ? `
  <div class="footer">
    ${invoice.footer}
    ${invoice.fromWebsite ? `<br><a href="${invoice.fromWebsite}" style="color: ${invoice.accentColor};">${invoice.fromWebsite}</a>` : ''}
  </div>
  ` : ''}
</body>
</html>`;
        }

        // Modern Template
        if (invoice.template === 'modern') {
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 0; color: #0f172a; }
    .header { background: linear-gradient(135deg, ${invoice.accentColor} 0%, ${invoice.accentColor}dd 100%); color: white; padding: 50px; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
    .invoice-title { font-size: 48px; font-weight: 800; letter-spacing: -1px; }
    .invoice-subtitle { font-size: 18px; opacity: 0.9; margin-top: 8px; }
    .main-content { padding: 50px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
    .info-card { background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; }
    .label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${invoice.accentColor}; letter-spacing: 1px; margin-bottom: 12px; }
    .name { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead { background: #f8fafc; }
    th { padding: 16px; text-align: left; font-weight: 700; font-size: 12px; text-transform: uppercase; color: #64748b; }
    td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
    .summary { background: #f8fafc; border-radius: 16px; padding: 30px; margin-top: 30px; }
    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; }
    .total-row { border-top: 3px solid ${invoice.accentColor}; padding-top: 16px; margin-top: 16px; font-size: 24px; font-weight: 700; color: ${invoice.accentColor}; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-subtitle">#${invoice.invoiceNumber}</div>
      </div>
      <div style="text-align: right;">
        ${statusBadge}
        <div style="margin-top: 16px; font-size: 14px; opacity: 0.9;">
          <div>Date: ${new Date(invoice.date).toLocaleDateString()}</div>
          <div>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="main-content">
    <div class="info-grid">
      <div class="info-card">
        <div class="label">From</div>
        <div class="name">${invoice.fromName || 'Your Company'}</div>
        ${invoice.fromAddress ? `<div style="color: #64748b; margin-top: 8px;">${invoice.fromAddress.replace(/\n/g, '<br>')}</div>` : ''}
        ${invoice.fromEmail ? `<div style="margin-top: 8px;">${invoice.fromEmail}</div>` : ''}
      </div>

      <div class="info-card">
        <div class="label">Bill To</div>
        <div class="name">${invoice.toName || 'Client Name'}</div>
        ${invoice.toAddress ? `<div style="color: #64748b; margin-top: 8px;">${invoice.toAddress.replace(/\n/g, '<br>')}</div>` : ''}
        ${invoice.toEmail ? `<div style="margin-top: 8px;">${invoice.toEmail}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: right;">Qty</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
          <tr>
            <td style="font-weight: 600;">${item.description || 'Item'}</td>
            <td style="text-align: right;">${item.quantity}</td>
            <td style="text-align: right;">${symbol}${item.rate.toFixed(2)}</td>
            <td style="text-align: right; font-weight: 600;">${symbol}${calculateItemTotal(item).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${symbol}${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `<div class="summary-row"><span>Discount</span><span>-${symbol}${discount.toFixed(2)}</span></div>` : ''}
      ${tax > 0 ? `<div class="summary-row"><span>Tax</span><span>${symbol}${tax.toFixed(2)}</span></div>` : ''}
      ${invoice.shippingCost > 0 ? `<div class="summary-row"><span>Shipping</span><span>${symbol}${invoice.shippingCost.toFixed(2)}</span></div>` : ''}
      <div class="summary-row total-row">
        <span>Total</span>
        <span>${symbol}${total.toFixed(2)}</span>
      </div>
      ${amountPaid > 0 ? `<div class="summary-row" style="color: #10b981;"><span>Paid</span><span>-${symbol}${amountPaid.toFixed(2)}</span></div>` : ''}
      ${amountDue !== total ? `<div class="summary-row" style="font-size: 20px; font-weight: 700;"><span>Amount Due</span><span>${symbol}${amountDue.toFixed(2)}</span></div>` : ''}
    </div>

    ${invoice.notes ? `<div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin-top: 30px;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}
  </div>
</body>
</html>`;
        }

        // Return minimal template as fallback
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f0f0f0; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div><h1>INVOICE</h1><p>#${invoice.invoiceNumber}</p></div>
    <div><p>Date: ${new Date(invoice.date).toLocaleDateString()}</p><p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p></div>
  </div>
  <div><strong>From:</strong> ${invoice.fromName}<br>${invoice.fromEmail}</div>
  <div style="margin-top: 20px;"><strong>To:</strong> ${invoice.toName}<br>${invoice.toEmail}</div>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
    <tbody>
      ${invoice.items.map(item => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${symbol}${item.rate.toFixed(2)}</td><td>${symbol}${calculateItemTotal(item).toFixed(2)}</td></tr>`).join('')}
    </tbody>
  </table>
  <div class="total">Total: ${symbol}${total.toFixed(2)}</div>
</body>
</html>`;
    };

    // File Operations
    const downloadInvoice = () => {
        const html = generateInvoiceHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Invoice downloaded successfully!');
    };

    const printInvoice = () => {
        const html = generateInvoiceHTML();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }
    };

    const copyHTML = () => {
        const html = generateInvoiceHTML();
        navigator.clipboard.writeText(html).then(() => {
            setCopied(true);
            toast.success('HTML copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const saveInvoiceData = () => {
        const json = JSON.stringify(invoice, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Invoice data saved!');
    };

    const loadInvoiceData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    setInvoice(data);
                    toast.success('Invoice data loaded!');
                } catch (error) {
                    toast.error('Failed to load invoice data');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <AnimatedElement>
            <div className="max-w-[1900px] mx-auto">
                <Card className="border-2">
                    <CardHeader className="bg-muted/50 dark:bg-slate-900/80 border-b">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                                    <Receipt className="h-8 w-8 text-blue-600" />
                                    Professional Invoice Generator
                                </CardTitle>
                                <CardDescription className="text-base mt-2">
                                    Create, manage, and track professional invoices with advanced features
                                </CardDescription>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline" className="text-sm py-2 px-4">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Total: {getCurrencySymbol()}{calculateTotal().toFixed(2)}
                                </Badge>
                                <Badge
                                    variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                                    className="text-sm py-2 px-4"
                                >
                                    {invoice.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto mb-6">
                                <TabsTrigger value="details">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="items">
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Items
                                </TabsTrigger>
                                <TabsTrigger value="payment">
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Payment
                                </TabsTrigger>
                                <TabsTrigger value="additional">
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Additional
                                </TabsTrigger>
                                <TabsTrigger value="settings">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </TabsTrigger>
                                <TabsTrigger value="preview">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </TabsTrigger>
                            </TabsList>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                {/* Form Section - Takes 2 columns */}
                                <div className="xl:col-span-2">
                                    <TabsContent value="details" className="space-y-6 mt-0">
                                        {/* Invoice Info */}
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                                                <Receipt className="h-5 w-5" />
                                                Invoice Information
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Invoice Number *</Label>
                                                    <Input
                                                        value={invoice.invoiceNumber}
                                                        onChange={(e) => updateField('invoiceNumber', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>PO Number</Label>
                                                    <Input
                                                        value={invoice.poNumber}
                                                        onChange={(e) => updateField('poNumber', e.target.value)}
                                                        placeholder="Optional"
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Invoice Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={invoice.date}
                                                        onChange={(e) => updateField('date', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Due Date *</Label>
                                                    <Input
                                                        type="date"
                                                        value={invoice.dueDate}
                                                        onChange={(e) => updateField('dueDate', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Status</Label>
                                                    <Select
                                                        value={invoice.status}
                                                        onValueChange={(value: any) => updateField('status', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">Draft</SelectItem>
                                                            <SelectItem value="sent">Sent</SelectItem>
                                                            <SelectItem value="paid">Paid</SelectItem>
                                                            <SelectItem value="overdue">Overdue</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Currency</Label>
                                                    <Select
                                                        value={invoice.currency}
                                                        onValueChange={(value) => updateField('currency', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {currencies.map(curr => (
                                                                <SelectItem key={curr.code} value={curr.code}>
                                                                    {curr.symbol} {curr.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* From Section */}
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                                                <Building2 className="h-5 w-5" />
                                                Your Business Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Business/Your Name *</Label>
                                                    <Input
                                                        placeholder="Acme Corporation"
                                                        value={invoice.fromName}
                                                        onChange={(e) => updateField('fromName', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Email</Label>
                                                        <Input
                                                            type="email"
                                                            placeholder="billing@acme.com"
                                                            value={invoice.fromEmail}
                                                            onChange={(e) => updateField('fromEmail', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Phone</Label>
                                                        <Input
                                                            placeholder="+1 (555) 123-4567"
                                                            value={invoice.fromPhone}
                                                            onChange={(e) => updateField('fromPhone', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Address</Label>
                                                    <Textarea
                                                        placeholder="123 Business St, Suite 100&#10;City, State 12345&#10;Country"
                                                        value={invoice.fromAddress}
                                                        onChange={(e) => updateField('fromAddress', e.target.value)}
                                                        rows={3}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Tax ID / VAT Number</Label>
                                                        <Input
                                                            placeholder="XX-XXXXXXX"
                                                            value={invoice.fromTaxId}
                                                            onChange={(e) => updateField('fromTaxId', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Website</Label>
                                                        <Input
                                                            placeholder="www.acme.com"
                                                            value={invoice.fromWebsite}
                                                            onChange={(e) => updateField('fromWebsite', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Client Section */}
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-lg flex items-center gap-2 text-primary">
                                                    <User className="h-5 w-5" />
                                                    Client Details
                                                </h3>
                                                <div className="flex gap-2">
                                                    {savedClients.length > 0 && (
                                                        <Select onValueChange={loadClient}>
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="Load client" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {savedClients.map(client => (
                                                                    <SelectItem key={client.id} value={client.id}>
                                                                        {client.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={saveClient}
                                                        disabled={!invoice.toName}
                                                    >
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Save Client
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Client Name / Company *</Label>
                                                    <Input
                                                        placeholder="Client Corporation"
                                                        value={invoice.toName}
                                                        onChange={(e) => updateField('toName', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Email</Label>
                                                        <Input
                                                            type="email"
                                                            placeholder="contact@client.com"
                                                            value={invoice.toEmail}
                                                            onChange={(e) => updateField('toEmail', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Phone</Label>
                                                        <Input
                                                            placeholder="+1 (555) 987-6543"
                                                            value={invoice.toPhone}
                                                            onChange={(e) => updateField('toPhone', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Address</Label>
                                                    <Textarea
                                                        placeholder="456 Client Ave&#10;City, State 54321&#10;Country"
                                                        value={invoice.toAddress}
                                                        onChange={(e) => updateField('toAddress', e.target.value)}
                                                        rows={3}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Tax ID / VAT Number</Label>
                                                    <Input
                                                        placeholder="XX-XXXXXXX"
                                                        value={invoice.toTaxId}
                                                        onChange={(e) => updateField('toTaxId', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="items" className="space-y-4 mt-0">
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                    <Calculator className="h-5 w-5" />
                                                    Line Items
                                                </h3>
                                                <Button onClick={addItem} size="sm">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Item
                                                </Button>
                                            </div>

                                            <div className="space-y-4">
                                                {invoice.items.map((item, index) => (
                                                    <Card key={item.id} className="p-4 border-2 bg-muted/50 dark:bg-slate-950">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-blue-600">Item {index + 1}</span>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => duplicateItem(item.id)}
                                                                        title="Duplicate"
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                    {invoice.items.length > 1 && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => removeItem(item.id)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <Label>Description *</Label>
                                                                <Textarea
                                                                    placeholder="E.g., Web Development Services - 10 hours"
                                                                    value={item.description}
                                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                                    rows={2}
                                                                    className="mt-1"
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-3">
                                                                <div>
                                                                    <Label>Quantity</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Rate ({getCurrencySymbol()})</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={item.rate}
                                                                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Amount</Label>
                                                                    <Input
                                                                        value={`${getCurrencySymbol()}${calculateItemTotal(item).toFixed(2)}`}
                                                                        disabled
                                                                        className="mt-1 font-semibold"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 pt-2">
                                                                <Switch
                                                                    checked={item.taxable}
                                                                    onCheckedChange={(checked) => updateItem(item.id, 'taxable', checked)}
                                                                />
                                                                <Label className="cursor-pointer">Taxable item</Label>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </Card>

                                        {/* Calculations */}
                                        <Card className="p-6 border-2 bg-muted/30 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4">Calculations</h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Discount Type</Label>
                                                        <Select
                                                            value={invoice.discountType}
                                                            onValueChange={(value: any) => updateField('discountType', value)}
                                                        >
                                                            <SelectTrigger className="mt-1 bg-background">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                <SelectItem value="fixed">Fixed Amount ({getCurrencySymbol()})</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Discount Value</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={invoice.discountValue}
                                                            onChange={(e) => updateField('discountValue', parseFloat(e.target.value) || 0)}
                                                            className="mt-1 bg-background"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Tax Rate (%)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.1"
                                                            value={invoice.taxRate}
                                                            onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                                                            className="mt-1 bg-background"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Shipping Cost ({getCurrencySymbol()})</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={invoice.shippingCost}
                                                            onChange={(e) => updateField('shippingCost', parseFloat(e.target.value) || 0)}
                                                            className="mt-1 bg-background"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="border-t pt-4 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Subtotal:</span>
                                                        <span className="font-semibold">{getCurrencySymbol()}{calculateSubtotal().toFixed(2)}</span>
                                                    </div>
                                                    {calculateDiscount() > 0 && (
                                                        <div className="flex justify-between text-sm text-green-600">
                                                            <span>Discount:</span>
                                                            <span className="font-semibold">-{getCurrencySymbol()}{calculateDiscount().toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {calculateTax() > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span>Tax ({invoice.taxRate}%):</span>
                                                            <span className="font-semibold">{getCurrencySymbol()}{calculateTax().toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {invoice.shippingCost > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span>Shipping:</span>
                                                            <span className="font-semibold">{getCurrencySymbol()}{invoice.shippingCost.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
                                                        <span>Total:</span>
                                                        <span className="text-blue-600">{getCurrencySymbol()}{calculateTotal().toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="payment" className="space-y-4 mt-0">
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                Payment Information
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Payment Terms</Label>
                                                    <Select
                                                        value={invoice.paymentTerms}
                                                        onValueChange={(value) => updateField('paymentTerms', value)}
                                                    >
                                                        <SelectTrigger className="mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                                                            <SelectItem value="Net 15">Net 15</SelectItem>
                                                            <SelectItem value="Net 30">Net 30</SelectItem>
                                                            <SelectItem value="Net 60">Net 60</SelectItem>
                                                            <SelectItem value="Net 90">Net 90</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Accepted Payment Methods</Label>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        {['Bank Transfer', 'Credit Card', 'PayPal', 'Check', 'Cash', 'Wire Transfer'].map(method => (
                                                            <div key={method} className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={invoice.paymentMethods.includes(method)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            updateField('paymentMethods', [...invoice.paymentMethods, method]);
                                                                        } else {
                                                                            updateField('paymentMethods', invoice.paymentMethods.filter(m => m !== method));
                                                                        }
                                                                    }}
                                                                />
                                                                <Label className="cursor-pointer">{method}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label>Bank Details</Label>
                                                    <Textarea
                                                        placeholder="Bank Name: ABC Bank&#10;Account Name: Your Business&#10;Account Number: XXXX-XXXX-XXXX&#10;Routing Number: XXXXXXXXX&#10;SWIFT/BIC: XXXXXXXX"
                                                        value={invoice.bankDetails}
                                                        onChange={(e) => updateField('bankDetails', e.target.value)}
                                                        rows={5}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Payment Instructions</Label>
                                                    <Textarea
                                                        placeholder="Special instructions for payment..."
                                                        value={invoice.paymentInstructions}
                                                        onChange={(e) => updateField('paymentInstructions', e.target.value)}
                                                        rows={3}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Payment Tracking */}
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-lg flex items-center gap-2">
                                                    <Clock className="h-5 w-5" />
                                                    Payment Tracking
                                                </h3>
                                                <Button onClick={addPayment} size="sm" variant="outline">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Record Payment
                                                </Button>
                                            </div>

                                            {invoice.payments.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                    <p>No payments recorded yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {invoice.payments.map(payment => (
                                                        <Card key={payment.id} className="p-4 bg-green-50 border-green-200">
                                                            <div className="grid grid-cols-4 gap-3">
                                                                <div>
                                                                    <Label className="text-xs">Date</Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={payment.date}
                                                                        onChange={(e) => updatePayment(payment.id, 'date', e.target.value)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Amount</Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={payment.amount}
                                                                        onChange={(e) => updatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                                                        className="mt-1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Method</Label>
                                                                    <Select
                                                                        value={payment.method}
                                                                        onValueChange={(value) => updatePayment(payment.id, 'method', value)}
                                                                    >
                                                                        <SelectTrigger className="mt-1">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                                                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                                            <SelectItem value="PayPal">PayPal</SelectItem>
                                                                            <SelectItem value="Check">Check</SelectItem>
                                                                            <SelectItem value="Cash">Cash</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Reference</Label>
                                                                    <div className="flex gap-2 mt-1">
                                                                        <Input
                                                                            placeholder="TX123"
                                                                            value={payment.reference}
                                                                            onChange={(e) => updatePayment(payment.id, 'reference', e.target.value)}
                                                                        />
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => removePayment(payment.id)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}

                                            {invoice.payments.length > 0 && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between font-semibold">
                                                            <span>Total Amount:</span>
                                                            <span>{getCurrencySymbol()}{calculateTotal().toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-600 font-semibold">
                                                            <span>Amount Paid:</span>
                                                            <span>-{getCurrencySymbol()}{calculateAmountPaid().toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-blue-300">
                                                            <span>Amount Due:</span>
                                                            <span className={calculateAmountDue() <= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                {getCurrencySymbol()}{calculateAmountDue().toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="additional" className="space-y-4 mt-0">
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4">Additional Information</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label>Notes / Description</Label>
                                                    <Textarea
                                                        placeholder="Add any notes for the client (e.g., project details, special instructions)..."
                                                        value={invoice.notes}
                                                        onChange={(e) => updateField('notes', e.target.value)}
                                                        rows={4}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Terms & Conditions</Label>
                                                    <Textarea
                                                        placeholder="Payment terms, late fees, warranties, etc..."
                                                        value={invoice.terms}
                                                        onChange={(e) => updateField('terms', e.target.value)}
                                                        rows={4}
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label>Footer Message</Label>
                                                    <Input
                                                        placeholder="Thank you for your business!"
                                                        value={invoice.footer}
                                                        onChange={(e) => updateField('footer', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Recurring Invoice */}
                                        <Card className="p-6 border-2 bg-purple-50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Switch
                                                    checked={invoice.isRecurring}
                                                    onCheckedChange={(checked) => updateField('isRecurring', checked)}
                                                />
                                                <Label className="font-bold text-lg cursor-pointer">Recurring Invoice</Label>
                                            </div>

                                            {invoice.isRecurring && (
                                                <div>
                                                    <Label>Frequency</Label>
                                                    <Select
                                                        value={invoice.recurringFrequency}
                                                        onValueChange={(value: any) => updateField('recurringFrequency', value)}
                                                    >
                                                        <SelectTrigger className="mt-1 bg-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="weekly">Weekly</SelectItem>
                                                            <SelectItem value="monthly">Monthly</SelectItem>
                                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                                            <SelectItem value="yearly">Yearly</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        This invoice will be automatically regenerated {invoice.recurringFrequency}.
                                                    </p>
                                                </div>
                                            )}
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="settings" className="space-y-4 mt-0">
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                <Settings className="h-5 w-5" />
                                                Invoice Settings
                                            </h3>
                                            <div className="space-y-6">
                                                <div>
                                                    <Label className="text-base font-semibold">Template Style</Label>
                                                    <div className="grid grid-cols-5 gap-3 mt-3">
                                                        {(['professional', 'modern', 'classic', 'minimal', 'creative'] as const).map(temp => (
                                                            <button
                                                                key={temp}
                                                                onClick={() => updateField('template', temp)}
                                                                className={`p-4 border-2 rounded-lg text-center capitalize transition-all ${invoice.template === temp
                                                                    ? 'border-blue-500 bg-blue-50 font-semibold'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                {temp}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label className="text-base font-semibold">Accent Color</Label>
                                                    <div className="flex gap-3 mt-3 flex-wrap">
                                                        {['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0891b2'].map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => updateField('accentColor', color)}
                                                                className={`w-14 h-14 rounded-lg border-2 transition-all ${invoice.accentColor === color ? 'border-black scale-110' : 'border-gray-300'
                                                                    }`}
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                        <input
                                                            type="color"
                                                            value={invoice.accentColor}
                                                            onChange={(e) => updateField('accentColor', e.target.value)}
                                                            className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <Label className="text-base font-semibold">Show Logo</Label>
                                                        <p className="text-sm text-gray-500">Display your company logo on the invoice</p>
                                                    </div>
                                                    <Switch
                                                        checked={invoice.showLogo}
                                                        onCheckedChange={(checked) => updateField('showLogo', checked)}
                                                    />
                                                </div>

                                                {invoice.showLogo && (
                                                    <div>
                                                        <Label>Logo URL</Label>
                                                        <Input
                                                            placeholder="https://example.com/logo.png"
                                                            value={invoice.logoUrl}
                                                            onChange={(e) => updateField('logoUrl', e.target.value)}
                                                            className="mt-1"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Recommended size: 200x80 pixels
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>

                                        <Card className="p-6 border-2 bg-amber-50">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5" />
                                                Data Management
                                            </h3>
                                            <div className="space-y-3">
                                                <Button onClick={saveInvoiceData} variant="outline" className="w-full justify-start">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Invoice Data (JSON)
                                                </Button>
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Load Invoice Data
                                                </Button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept=".json"
                                                    onChange={loadInvoiceData}
                                                    className="hidden"
                                                />
                                                <p className="text-xs text-gray-600">
                                                    Save your invoice data to reuse later or create templates
                                                </p>
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="preview" className="mt-0">
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="font-bold text-lg">Invoice Preview</h3>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setShowPreview(!showPreview)}
                                                >
                                                    {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                                    {showPreview ? 'Hide' : 'Show'}
                                                </Button>
                                            </div>

                                            {showPreview && (
                                                <div className="border-2 rounded-lg p-8 bg-white overflow-auto max-h-[800px]">
                                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateInvoiceHTML()) }} />
                                                </div>
                                            )}
                                        </Card>
                                    </TabsContent>
                                </div>

                                {/* Summary Panel - Fixed on right */}
                                <div className="xl:col-span-1">
                                    <div className="sticky top-4 space-y-4">
                                        {/* Quick Summary */}
                                        <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 to-purple-50">
                                            <h3 className="font-bold text-lg mb-4">Invoice Summary</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Invoice #:</span>
                                                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Date:</span>
                                                    <span className="font-semibold">{new Date(invoice.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Due Date:</span>
                                                    <span className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Status:</span>
                                                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                        {invoice.status}
                                                    </Badge>
                                                </div>
                                                <div className="border-t pt-3 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Items:</span>
                                                        <span className="font-semibold">{invoice.items.length}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Subtotal:</span>
                                                        <span className="font-semibold">{getCurrencySymbol()}{calculateSubtotal().toFixed(2)}</span>
                                                    </div>
                                                    {calculateDiscount() > 0 && (
                                                        <div className="flex justify-between text-sm text-green-600">
                                                            <span>Discount:</span>
                                                            <span className="font-semibold">-{getCurrencySymbol()}{calculateDiscount().toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    {calculateTax() > 0 && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Tax:</span>
                                                            <span className="font-semibold">{getCurrencySymbol()}{calculateTax().toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
                                                        <span>Total:</span>
                                                        <span className="text-blue-600">{getCurrencySymbol()}{calculateTotal().toFixed(2)}</span>
                                                    </div>
                                                    {calculateAmountPaid() > 0 && (
                                                        <>
                                                            <div className="flex justify-between text-sm text-green-600">
                                                                <span>Paid:</span>
                                                                <span className="font-semibold">-{getCurrencySymbol()}{calculateAmountPaid().toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-lg font-bold text-red-600">
                                                                <span>Due:</span>
                                                                <span>{getCurrencySymbol()}{calculateAmountDue().toFixed(2)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Actions */}
                                        <Card className="p-6 border-2 dark:bg-slate-900/50">
                                            <h3 className="font-bold text-lg mb-4">Actions</h3>
                                            <div className="space-y-2">
                                                <Button onClick={downloadInvoice} className="w-full justify-start" size="lg">
                                                    <Download className="h-5 w-5 mr-2" />
                                                    Download HTML
                                                </Button>
                                                <Button onClick={printInvoice} variant="outline" className="w-full justify-start" size="lg">
                                                    <Printer className="h-5 w-5 mr-2" />
                                                    Print / Save as PDF
                                                </Button>
                                                <Button onClick={copyHTML} variant="outline" className="w-full justify-start" size="lg">
                                                    {copied ? <Check className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
                                                    {copied ? 'Copied!' : 'Copy HTML'}
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start" size="lg" disabled>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    Send via Email
                                                </Button>
                                            </div>
                                        </Card>

                                        {/* Tips */}
                                        <Card className="p-6 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
                                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                                <Star className="h-5 w-5 text-yellow-500" />
                                                Pro Tips
                                            </h3>
                                            <ul className="text-sm space-y-2 text-gray-700">
                                                <li>• Use descriptive item descriptions</li>
                                                <li>• Set clear payment terms</li>
                                                <li>• Track payments regularly</li>
                                                <li>• Save client details for future use</li>
                                                <li>• Customize colors to match your brand</li>
                                            </ul>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default EnhancedInvoiceGenerator;