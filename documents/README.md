# Document Templates

This folder contains printable HTML templates for various reports and documents used in the Nigeria Tax Calculator application.

## Available Templates

### invoice-template.html
A simple printable invoice template with placeholders for business information, invoice details, and line items.

**Usage:**
1. Copy the template content
2. Replace placeholder tokens like `{{BUSINESS_NAME}}`, `{{DATE}}`, `{{INVOICE_NO}}`, etc. with actual values
3. Open in browser or print directly

**Placeholders:**
- `{{BUSINESS_NAME}}` - Name of the business
- `{{BUSINESS_ADDRESS}}` - Business address
- `{{DATE}}` - Invoice date
- `{{INVOICE_NO}}` - Invoice number
- `{{BILL_TO_NAME}}` - Customer name
- `{{BILL_TO_ADDRESS}}` - Customer address
- `{{ITEMS}}` - Invoice line items (HTML table rows)
- `{{SUBTOTAL}}` - Subtotal amount
- `{{VAT}}` - VAT amount
- `{{TOTAL}}` - Total amount

### paye-summary-template.html
A printable PAYE (Pay As You Earn) tax summary template showing salary, deductions, and tax calculations.

**Usage:**
1. Copy the template content
2. Replace placeholder tokens with actual user and business data
3. Open in browser or print directly

**Placeholders:**
- `{{USER_NAME}}` - Employee/user name
- `{{BUSINESS_NAME}}` - Business name
- `{{PERIOD_FROM}}` - Start date of the period
- `{{PERIOD_TO}}` - End date of the period
- `{{GROSS_INCOME}}` - Total gross income
- `{{DEDUCTIONS}}` - Total deductions
- `{{RENT_RELIEF}}` - Rent relief amount
- `{{TAXABLE_INCOME}}` - Taxable income after deductions
- `{{TAX_BREAKDOWN}}` - HTML table rows showing tax slices
- `{{TOTAL_TAX}}` - Total tax amount

### vat-summary-template.html
A printable VAT (Value Added Tax) summary template showing VAT output, input, and payable amounts.

**Usage:**
1. Copy the template content
2. Replace placeholder tokens with actual VAT data
3. Open in browser or print directly

**Placeholders:**
- `{{BUSINESS_NAME}}` - Business name
- `{{PERIOD_FROM}}` - Start date of the period
- `{{PERIOD_TO}}` - End date of the period
- `{{VAT_RATE}}` - VAT rate percentage
- `{{VAT_OUTPUT}}` - VAT on sales (output)
- `{{VAT_INPUT}}` - VAT on purchases (input)
- `{{VAT_PAYABLE}}` - Net VAT payable

## Notes

- All templates are styled for printing (A4 paper size)
- Templates use inline CSS for portability
- No external dependencies required
- Compatible with all modern browsers
