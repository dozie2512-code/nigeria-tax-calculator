# Invoicing and Cashbook Documentation

## Overview
This document describes the invoicing and cashbook features added to the Nigeria Tax Calculator application.

## Features

### 1. Invoicing Functionality

The invoicing feature allows users to create, manage, and track invoices for their business.

#### Key Features:
- **Create Invoices**: Generate professional invoices with customer details, itemized charges, and VAT calculations
- **Invoice Management**: View, edit, and delete invoices
- **Status Tracking**: Track invoice statuses (Unpaid, Paid, Overdue)
- **PDF Export**: Export invoices to PDF format using jsPDF library
- **VAT Integration**: Automatic VAT calculation based on business settings
- **Payment Terms**: Configurable payment terms (Immediate, Net 7, 15, 30, 60 days)
- **Transaction Creation**: Automatically creates revenue transactions when invoices are marked as paid

#### Invoice Fields:
- Invoice Number (auto-generated)
- Date and Due Date
- Customer Information (Name, Email, Phone, Address)
- Line Items (Description, Quantity, Unit Price)
- VAT Type (None, Exclusive, Inclusive)
- Payment Terms
- Calculated Totals (Subtotal, VAT Amount, Total)

#### Invoice Actions:
- **View**: Opens invoice in a new window with print-ready format
- **Edit**: Modify invoice details
- **Mark as Paid/Unpaid**: Toggle invoice payment status
- **Export PDF**: Download invoice as PDF
- **Delete**: Remove invoice from system

#### Integration with Tax System:
When an invoice is marked as "Paid", the system automatically:
1. Creates a Revenue transaction in the ledger
2. Links to the "Sales Revenue" account
3. Includes VAT calculations in tax summaries
4. Updates the business's taxable income

### 2. Cashbook Functionality

The cashbook feature provides real-time cash flow tracking for businesses.

#### Key Features:
- **Cash Entry Management**: Record cash inflows and outflows
- **Category Classification**: Pre-defined categories for revenue and expenses
- **Running Balance**: Real-time balance calculations
- **Date Filtering**: Filter entries by date range
- **Transaction Integration**: Automatically creates ledger transactions

#### Cashbook Entry Fields:
- Date
- Type (Inflow/Outflow)
- Category (Sales, Services, Purchases, Salaries, etc.)
- Amount
- Description

#### Balance Calculations:
The cashbook displays:
- **Opening Balance**: Balance before the filtered date range
- **Total Inflows**: Sum of all cash received
- **Total Outflows**: Sum of all cash paid
- **Current Balance**: Real-time running balance

#### Categories:

**Revenue (Inflows):**
- Sales
- Services
- Investment Income
- Other Income

**Expenses (Outflows):**
- Purchases
- Salaries
- Rent
- Utilities
- Office Supplies
- Marketing
- Transportation
- Other Expenses

#### Integration with Tax System:
When a cashbook entry is created, the system automatically:
1. Creates a corresponding ledger transaction
2. Links to the appropriate account based on category
3. Includes in tax calculations (Revenue/Expense)
4. Updates P&L and tax summaries

## User Guide

### Creating an Invoice

1. Navigate to the **Invoicing** tab
2. Click **Create Invoice**
3. Fill in customer details
4. Add line items (description, quantity, unit price)
5. Select VAT type if applicable
6. Choose payment terms
7. Review calculated totals
8. Click **Save Invoice**

### Managing Invoices

- **Filter by Status**: Use the filter dropdown to view All, Unpaid, Paid, or Overdue invoices
- **Mark as Paid**: Click the "Paid" button on any unpaid invoice
- **Export PDF**: Click the "PDF" button to download the invoice
- **View Details**: Click "View" to see the full invoice in a new window

### Adding Cashbook Entries

1. Navigate to the **Cashbook** tab
2. Click **Add Entry**
3. Select date and type (Inflow/Outflow)
4. Choose appropriate category
5. Enter amount and description
6. Click **Save Entry**

### Filtering Cashbook Entries

1. Enter **From** and **To** dates
2. Click **Filter** to apply date range
3. Click **Clear** to reset filters
4. View updated balance calculations

## Technical Implementation

### Data Structure

**Invoices:**
```javascript
state.invoices = {
  'userId_businessId': [
    {
      id: 'inv_...',
      invoiceNumber: 'INV-XXX-0001',
      date: '2026-01-24',
      dueDate: '2026-02-23',
      customerName: 'Customer Name',
      customerEmail: 'email@example.com',
      customerPhone: '1234567890',
      customerAddress: 'Address',
      items: [
        { description: 'Item', qty: 1, price: 1000 }
      ],
      vatType: 'exclusive',
      paymentTerms: 'net30',
      subtotal: 1000,
      vatAmount: 75,
      total: 1075,
      status: 'unpaid' // or 'paid', 'overdue'
    }
  ]
}
```

**Cashbook:**
```javascript
state.cashbook = {
  'userId_businessId': [
    {
      id: 'cash_...',
      date: '2026-01-24',
      type: 'inflow', // or 'outflow'
      category: 'Sales',
      amount: 10000,
      description: 'Cash sale'
    }
  ]
}
```

### State Migration

The `migrateState()` function ensures backward compatibility:
```javascript
state.invoices = state.invoices || {};
state.cashbook = state.cashbook || {};
```

### PDF Generation

Invoices can be exported to PDF using the jsPDF library:
- Library loaded from CDN: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- PDF includes all invoice details in a professional format
- Supports both preview and download

## Best Practices

### Invoicing:
1. Always include detailed item descriptions
2. Set realistic payment terms based on customer agreements
3. Mark invoices as paid promptly to maintain accurate records
4. Use VAT settings consistent with business requirements

### Cashbook:
1. Record transactions daily for accuracy
2. Use appropriate categories for proper tax classification
3. Add detailed descriptions for future reference
4. Reconcile with bank statements regularly

## Troubleshooting

### Invoice not showing in tax calculations:
- Ensure the invoice is marked as "Paid"
- Check that VAT type is properly selected
- Verify business has correct VAT settings enabled

### Cashbook balance incorrect:
- Check date filters are applied correctly
- Verify all entries have correct type (Inflow/Outflow)
- Review opening balance calculation

### PDF export not working:
- Ensure jsPDF library is loaded (check browser console)
- Verify browser allows downloads
- Try disabling ad blockers that may block CDN resources

## Future Enhancements

Potential improvements for future versions:
- Email invoice functionality
- Recurring invoice support
- Cashbook bank reconciliation
- Multi-currency support
- Invoice templates customization
- Cashbook import from bank statements
- Advanced reporting and analytics
