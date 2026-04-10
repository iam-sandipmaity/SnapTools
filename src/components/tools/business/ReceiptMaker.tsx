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
    Download,
    FileText,
    Plus,
    Trash2,
    Upload,
    Eye,
    Percent,
    DollarSign,
    Calculator,
    Palette,
    Settings,
    Copy,
    Mail,
    QrCode
} from 'lucide-react';

interface ReceiptItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxable: boolean;
}

interface ReceiptData {
    receiptNumber: string;
    date: string;
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    businessWebsite: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: string;
    items: ReceiptItem[];
    notes: string;
    taxRate: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    shipping: number;
    currency: string;
    logo: string;
    template: 'classic' | 'modern' | 'minimal' | 'elegant';
    showQR: boolean;
    termsAndConditions: string;
}

const ReceiptMaker: React.FC = () => {
    const [receipt, setReceipt] = useState<ReceiptData>({
        receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        businessName: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        businessWebsite: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        paymentMethod: 'Cash',
        items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxable: true }],
        notes: '',
        taxRate: 0,
        discountType: 'percentage',
        discountValue: 0,
        shipping: 0,
        currency: 'USD',
        logo: '',
        template: 'classic',
        showQR: false,
        termsAndConditions: '',
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currencies = [
        { code: 'USD', symbol: '$' },
        { code: 'EUR', symbol: '€' },
        { code: 'GBP', symbol: '£' },
        { code: 'JPY', symbol: '¥' },
        { code: 'INR', symbol: '₹' },
        { code: 'CAD', symbol: 'C$' },
        { code: 'AUD', symbol: 'A$' },
    ];

    const getCurrencySymbol = () => {
        return currencies.find(c => c.code === receipt.currency)?.symbol || '$';
    };

    const updateField = (field: keyof ReceiptData, value: any) => {
        setReceipt(prev => ({ ...prev, [field]: value }));
    };

    const addItem = () => {
        const newItem: ReceiptItem = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxable: true,
        };
        setReceipt(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const removeItem = (id: string) => {
        if (receipt.items.length === 1) {
            toast.error('Receipt must have at least one item');
            return;
        }
        setReceipt(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    };

    const updateItem = (id: string, field: keyof ReceiptItem, value: any) => {
        setReceipt(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const duplicateItem = (id: string) => {
        const itemToDuplicate = receipt.items.find(item => item.id === id);
        if (itemToDuplicate) {
            const newItem = {
                ...itemToDuplicate,
                id: Date.now().toString(),
                description: `${itemToDuplicate.description} (Copy)`
            };
            setReceipt(prev => ({ ...prev, items: [...prev.items, newItem] }));
            toast.success('Item duplicated');
        }
    };

    const calculateSubtotal = () => {
        return receipt.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTax = () => {
        const taxableAmount = receipt.items
            .filter(item => item.taxable)
            .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        return (taxableAmount * receipt.taxRate) / 100;
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        if (receipt.discountType === 'percentage') {
            return (subtotal * receipt.discountValue) / 100;
        }
        return receipt.discountValue;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTax();
        const discount = calculateDiscount();
        const shipping = receipt.shipping || 0;
        return subtotal + tax - discount + shipping;
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) {
                toast.error('Logo must be less than 500KB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceipt(prev => ({ ...prev, logo: reader.result as string }));
                toast.success('Logo uploaded');
            };
            reader.readAsDataURL(file);
        }
    };

    const generateQRCode = () => {
        const data = `Receipt: ${receipt.receiptNumber}\nBusiness: ${receipt.businessName}\nTotal: ${getCurrencySymbol()}${calculateTotal().toFixed(2)}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
    };

    const generateReceiptHTML = () => {
        const subtotal = calculateSubtotal();
        const tax = calculateTax();
        const discount = calculateDiscount();
        const total = calculateTotal();
        const symbol = getCurrencySymbol();

        const templates = {
            classic: {
                fontFamily: "'Courier New', monospace",
                headerBg: '#fff',
                headerBorder: '2px solid #333',
                accentColor: '#333',
            },
            modern: {
                fontFamily: "'Arial', sans-serif",
                headerBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                headerBorder: 'none',
                accentColor: '#667eea',
            },
            minimal: {
                fontFamily: "'Helvetica Neue', sans-serif",
                headerBg: '#f8f9fa',
                headerBorder: '1px solid #dee2e6',
                accentColor: '#212529',
            },
            elegant: {
                fontFamily: "'Georgia', serif",
                headerBg: '#2c3e50',
                headerBorder: '3px double #ecf0f1',
                accentColor: '#2c3e50',
            },
        };

        const style = templates[receipt.template];

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ${style.fontFamily}; 
      max-width: 600px; 
      margin: 20px auto; 
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt { 
      background-color: #fff;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      padding: 20px;
      background: ${style.headerBg};
      border: ${style.headerBorder};
      border-radius: 6px;
      ${receipt.template === 'modern' ? 'color: white;' : ''}
    }
    .logo { 
      max-width: 150px; 
      max-height: 80px; 
      margin-bottom: 15px;
      object-fit: contain;
    }
    .business-name { 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 8px;
      color: ${receipt.template === 'modern' ? 'white' : style.accentColor};
    }
    .business-info { 
      font-size: 13px; 
      line-height: 1.8;
      ${receipt.template === 'modern' ? 'color: rgba(255,255,255,0.9);' : 'color: #666;'}
    }
    .section { 
      margin: 25px 0;
      padding: 15px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .section:last-of-type { border-bottom: none; }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      color: ${style.accentColor};
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 13px;
    }
    .info-item { display: flex; gap: 8px; }
    .info-label { 
      font-weight: 600; 
      color: #555;
      min-width: 80px;
    }
    .info-value { color: #333; }
    .items-table { 
      width: 100%; 
      border-collapse: collapse;
      margin: 20px 0;
    }
    .items-table th {
      background-color: #f8f9fa;
      padding: 12px 8px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #666;
      border-bottom: 2px solid ${style.accentColor};
    }
    .items-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 13px;
    }
    .items-table tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { 
      margin-top: 30px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 6px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .total-row.subtotal { color: #666; }
    .total-row.discount { color: #28a745; }
    .total-row.tax { color: #666; }
    .total-row.shipping { color: #666; }
    .total-row.grand-total {
      font-size: 20px;
      font-weight: bold;
      padding-top: 15px;
      margin-top: 15px;
      border-top: 2px solid ${style.accentColor};
      color: ${style.accentColor};
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      font-size: 12px;
      color: #666;
    }
    .qr-code {
      margin: 20px auto;
      text-align: center;
    }
    .qr-code img {
      border: 2px solid #e0e0e0;
      padding: 10px;
      border-radius: 6px;
    }
    .notes {
      margin-top: 20px;
      padding: 15px;
      background-color: #fff9e6;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      font-size: 12px;
      line-height: 1.6;
    }
    .terms {
      margin-top: 15px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 4px;
      font-size: 11px;
      line-height: 1.6;
      color: #666;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background-color: ${style.accentColor};
      color: white;
      border-radius: 12px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    @media print {
      body { background-color: white; margin: 0; }
      .receipt { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${receipt.logo ? `<img src="${receipt.logo}" alt="Logo" class="logo">` : ''}
      <div class="business-name">${receipt.businessName || 'BUSINESS NAME'}</div>
      <div class="business-info">
        ${receipt.businessAddress ? `${receipt.businessAddress}<br>` : ''}
        ${receipt.businessPhone ? `Tel: ${receipt.businessPhone}` : ''}
        ${receipt.businessPhone && receipt.businessEmail ? ' | ' : ''}
        ${receipt.businessEmail ? `Email: ${receipt.businessEmail}` : ''}
        ${receipt.businessWebsite ? `<br>Web: ${receipt.businessWebsite}` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Receipt Information</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Receipt #:</span>
          <span class="info-value"><strong>${receipt.receiptNumber}</strong></span>
        </div>
        <div class="info-item">
          <span class="info-label">Date:</span>
          <span class="info-value">${new Date(receipt.date).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Time:</span>
          <span class="info-value">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Payment:</span>
          <span class="info-value"><span class="badge">${receipt.paymentMethod}</span></span>
        </div>
      </div>
    </div>

    ${receipt.customerName || receipt.customerEmail || receipt.customerPhone ? `
    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-grid">
        ${receipt.customerName ? `
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${receipt.customerName}</span>
        </div>` : ''}
        ${receipt.customerEmail ? `
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">${receipt.customerEmail}</span>
        </div>` : ''}
        ${receipt.customerPhone ? `
        <div class="info-item">
          <span class="info-label">Phone:</span>
          <span class="info-value">${receipt.customerPhone}</span>
        </div>` : ''}
      </div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">Items</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${receipt.items.map(item => `
            <tr>
              <td>
                ${item.description || 'Item'}
                ${!item.taxable ? ' <span style="font-size: 10px; color: #999;">(Tax Exempt)</span>' : ''}
              </td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${symbol}${item.unitPrice.toFixed(2)}</td>
              <td class="text-right"><strong>${symbol}${(item.quantity * item.unitPrice).toFixed(2)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="total-row subtotal">
        <span>Subtotal:</span>
        <span>${symbol}${subtotal.toFixed(2)}</span>
      </div>
      ${discount > 0 ? `
      <div class="total-row discount">
        <span>Discount ${receipt.discountType === 'percentage' ? `(${receipt.discountValue}%)` : ''}:</span>
        <span>-${symbol}${discount.toFixed(2)}</span>
      </div>` : ''}
      ${receipt.taxRate > 0 ? `
      <div class="total-row tax">
        <span>Tax (${receipt.taxRate}%):</span>
        <span>${symbol}${tax.toFixed(2)}</span>
      </div>` : ''}
      ${receipt.shipping > 0 ? `
      <div class="total-row shipping">
        <span>Shipping:</span>
        <span>${symbol}${receipt.shipping.toFixed(2)}</span>
      </div>` : ''}
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>${symbol}${total.toFixed(2)}</span>
      </div>
    </div>

    ${receipt.notes ? `
    <div class="notes">
      <strong>Notes:</strong><br>
      ${receipt.notes}
    </div>` : ''}

    ${receipt.termsAndConditions ? `
    <div class="terms">
      <strong>Terms & Conditions:</strong><br>
      ${receipt.termsAndConditions}
    </div>` : ''}

    ${receipt.showQR ? `
    <div class="qr-code">
      <img src="${generateQRCode()}" alt="QR Code">
      <div style="margin-top: 10px; font-size: 11px; color: #666;">
        Scan for receipt details
      </div>
    </div>` : ''}

    <div class="footer">
      <strong>THANK YOU FOR YOUR BUSINESS!</strong><br>
      Please keep this receipt for your records<br>
      ${receipt.businessEmail ? `Questions? Contact us at ${receipt.businessEmail}` : ''}
    </div>
  </div>
</body>
</html>`;
    };

    const downloadReceipt = () => {
        const html = generateReceiptHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.receiptNumber}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Receipt downloaded!');
    };

    const printReceipt = () => {
        const html = generateReceiptHTML();
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

    const emailReceipt = () => {
        const subject = `Receipt ${receipt.receiptNumber} - ${receipt.businessName}`;
        const body = `Please find your receipt attached.\n\nReceipt Number: ${receipt.receiptNumber}\nDate: ${new Date(receipt.date).toLocaleDateString()}\nTotal: ${getCurrencySymbol()}${calculateTotal().toFixed(2)}`;
        window.location.href = `mailto:${receipt.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <AnimatedElement>
            <div className="max-w-7xl mx-auto">
                <Card>
                    <CardHeader className="bg-muted/50 dark:bg-slate-900/80 border-b">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                            <FileText className="h-8 w-8 text-blue-600" />
                            Professional Receipt Maker
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Create beautiful, customizable receipts with advanced features
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Input Form */}
                            <div className="space-y-4 overflow-y-auto max-h-[800px] pr-2">
                                {/* Basic Info */}
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/30 dark:bg-slate-900/50">
                                    <h3 className="font-semibold flex items-center gap-2 text-primary">
                                        <FileText className="h-4 w-4" />
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="receiptNumber">Receipt Number</Label>
                                            <Input
                                                id="receiptNumber"
                                                value={receipt.receiptNumber}
                                                onChange={(e) => updateField('receiptNumber', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={receipt.date}
                                                onChange={(e) => updateField('date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information */}
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/30 dark:bg-slate-900/50">
                                    <h3 className="font-semibold text-primary">Business Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <Label>Logo (Max 500KB)</Label>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleLogoUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <Button
                                                onClick={() => fileInputRef.current?.click()}
                                                variant="outline"
                                                className="w-full mt-1"
                                                size="sm"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                {receipt.logo ? 'Change Logo' : 'Upload Logo'}
                                            </Button>
                                            {receipt.logo && (
                                                <div className="mt-2 text-center">
                                                    <img src={receipt.logo} alt="Logo" className="max-h-16 mx-auto" />
                                                </div>
                                            )}
                                        </div>
                                        <Input
                                            placeholder="Business Name *"
                                            value={receipt.businessName}
                                            onChange={(e) => updateField('businessName', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Address"
                                            value={receipt.businessAddress}
                                            onChange={(e) => updateField('businessAddress', e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Phone"
                                                value={receipt.businessPhone}
                                                onChange={(e) => updateField('businessPhone', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                value={receipt.businessEmail}
                                                onChange={(e) => updateField('businessEmail', e.target.value)}
                                            />
                                        </div>
                                        <Input
                                            placeholder="Website"
                                            value={receipt.businessWebsite}
                                            onChange={(e) => updateField('businessWebsite', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/30 dark:bg-slate-900/50">
                                    <h3 className="font-semibold text-primary">Customer Information</h3>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Customer Name"
                                            value={receipt.customerName}
                                            onChange={(e) => updateField('customerName', e.target.value)}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                value={receipt.customerEmail}
                                                onChange={(e) => updateField('customerEmail', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Phone"
                                                value={receipt.customerPhone}
                                                onChange={(e) => updateField('customerPhone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentMethod">Payment Method</Label>
                                            <select
                                                id="paymentMethod"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={receipt.paymentMethod}
                                                onChange={(e) => updateField('paymentMethod', e.target.value)}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Credit Card">Credit Card</option>
                                                <option value="Debit Card">Debit Card</option>
                                                <option value="Check">Check</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Mobile Payment">Mobile Payment</option>
                                                <option value="PayPal">PayPal</option>
                                                <option value="Cryptocurrency">Cryptocurrency</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/30 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-center text-primary">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Calculator className="h-4 w-4" />
                                            Items
                                        </h3>
                                        <Button onClick={addItem} size="sm">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {receipt.items.map((item, index) => (
                                            <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-background/50">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-medium">Item {index + 1}</span>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            onClick={() => duplicateItem(item.id)}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0"
                                                            title="Duplicate"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                        {receipt.items.length > 1 && (
                                                            <Button
                                                                onClick={() => removeItem(item.id)}
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-red-500" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <Input
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Quantity"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Unit Price"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`taxable-${item.id}`}
                                                        checked={item.taxable}
                                                        onChange={(e) => updateItem(item.id, 'taxable', e.target.checked)}
                                                        className="h-4 w-4"
                                                    />
                                                    <label htmlFor={`taxable-${item.id}`} className="text-sm cursor-pointer">
                                                        Taxable
                                                    </label>
                                                    <span className="ml-auto font-medium text-sm">
                                                        {getCurrencySymbol()}{(item.quantity * item.unitPrice).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Advanced Settings */}
                                <div className="space-y-4 border rounded-lg p-4 bg-muted/30 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-center text-primary">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Advanced Settings
                                        </h3>
                                        <Button
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            {showAdvanced ? 'Hide' : 'Show'}
                                        </Button>
                                    </div>

                                    {showAdvanced && (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="currency">Currency</Label>
                                                <select
                                                    id="currency"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={receipt.currency}
                                                    onChange={(e) => updateField('currency', e.target.value)}
                                                >
                                                    {currencies.map(curr => (
                                                        <option key={curr.code} value={curr.code}>
                                                            {curr.code} ({curr.symbol})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="taxRate">
                                                        <Percent className="h-3 w-3 inline mr-1" />
                                                        Tax Rate (%)
                                                    </Label>
                                                    <Input
                                                        id="taxRate"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={receipt.taxRate}
                                                        onChange={(e) => updateField('taxRate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="shipping">
                                                        <DollarSign className="h-3 w-3 inline mr-1" />
                                                        Shipping
                                                    </Label>
                                                    <Input
                                                        id="shipping"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={receipt.shipping}
                                                        onChange={(e) => updateField('shipping', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Discount</Label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={receipt.discountType}
                                                        onChange={(e) => updateField('discountType', e.target.value)}
                                                    >
                                                        <option value="percentage">Percentage (%)</option>
                                                        <option value="fixed">Fixed Amount</option>
                                                    </select>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0"
                                                        value={receipt.discountValue}
                                                        onChange={(e) => updateField('discountValue', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="template">
                                                    <Palette className="h-3 w-3 inline mr-1" />
                                                    Template Style
                                                </Label>
                                                <select
                                                    id="template"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={receipt.template}
                                                    onChange={(e) => updateField('template', e.target.value)}
                                                >
                                                    <option value="classic">Classic</option>
                                                    <option value="modern">Modern</option>
                                                    <option value="minimal">Minimal</option>
                                                    <option value="elegant">Elegant</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="showQR"
                                                    checked={receipt.showQR}
                                                    onChange={(e) => updateField('showQR', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <label htmlFor="showQR" className="text-sm cursor-pointer flex items-center gap-1">
                                                    <QrCode className="h-4 w-4" />
                                                    Include QR Code
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Notes and Terms */}
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Additional notes or comments"
                                            value={receipt.notes}
                                            onChange={(e) => updateField('notes', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="terms">Terms & Conditions</Label>
                                        <Textarea
                                            id="terms"
                                            placeholder="Return policy, warranty, etc."
                                            value={receipt.termsAndConditions}
                                            onChange={(e) => updateField('termsAndConditions', e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-muted/50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2 border">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>{getCurrencySymbol()}{calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    {calculateDiscount() > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount:</span>
                                            <span>-{getCurrencySymbol()}{calculateDiscount().toFixed(2)}</span>
                                        </div>
                                    )}
                                    {receipt.taxRate > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Tax ({receipt.taxRate}%):</span>
                                            <span>{getCurrencySymbol()}{calculateTax().toFixed(2)}</span>
                                        </div>
                                    )}
                                    {receipt.shipping > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping:</span>
                                            <span>{getCurrencySymbol()}{receipt.shipping.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-muted-foreground/20">
                                        <span>Total:</span>
                                        <span>{getCurrencySymbol()}{calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 pb-4 border-b">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-primary" />
                                        Live Preview
                                    </h3>
                                </div>

                                <div className="border rounded-lg p-4 bg-muted/50 dark:bg-slate-950 overflow-auto max-h-[700px] shadow-inner">
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateReceiptHTML()) }} />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={downloadReceipt} className="w-full">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download HTML
                                    </Button>
                                    <Button onClick={printReceipt} variant="outline" className="w-full">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    {receipt.customerEmail && (
                                        <Button
                                            onClick={emailReceipt}
                                            variant="outline"
                                            className="col-span-2"
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Email to Customer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default ReceiptMaker;