# API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication

All API endpoints (except auth) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
Response: { "token": "jwt_token", "user": {...} }
```

#### Login
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: { "token": "jwt_token", "user": {...} }
```

#### Invite User
```
POST /auth/invite
Body: {
  "email": "newuser@example.com",
  "businessId": "uuid",
  "role": "Admin|Manager|Accountant|Viewer"
}
Response: { "message": "User invited successfully", "user": {...} }
```

#### Get Profile
```
GET /auth/profile
Response: { "user": {...} }
```

### File Upload

#### Upload Single File
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (Form Data)
Response: { "url": "...", "filename": "..." }
```

#### Upload Multiple Files
```
POST /api/upload/multiple
Content-Type: multipart/form-data
Body: files[] (Form Data, max 10 files)
Response: { "files": [{url, filename}, ...] }
```

### Business

#### Create Business
```
POST /api/businesses
Body: {
  "name": "Business Name",
  "businessType": "Company|Sole Proprietor",
  "registrationNumber": "RC123456",
  "address": "...",
  "phone": "...",
  "email": "..."
}
```

#### Get All Businesses
```
GET /api/businesses
Response: { "businesses": [...] }
```

#### Get Business by ID
```
GET /api/businesses/:businessId
Response: { "business": {...} }
```

#### Update Business
```
PUT /api/businesses/:businessId
Body: { ...updated fields }
```

#### Get Business Settings
```
GET /api/businesses/:businessId/settings
Response: { "settings": {...} }
```

#### Update Business Settings
```
PUT /api/businesses/:businessId/settings
Body: {
  "defaultVatRate": 7.5,
  "defaultWhtRate": 5,
  "citRate": 25,
  "defaultDepreciationRate": 10,
  "defaultCapitalAllowanceRate": 25,
  "lossReliefBf": 0,
  "capitalAllowanceBf": 0,
  "chargeableLossBf": 0,
  "vatEnabled": true,
  "whtEnabled": true,
  "citEnabled": true,
  "pitEnabled": false,
  "payeEnabled": true
}
```

### Chart of Accounts

#### Get All Accounts
```
GET /api/businesses/:businessId/accounts
Response: { "accounts": [...] }
```

#### Create Account
```
POST /api/businesses/:businessId/accounts
Body: {
  "code": "1000",
  "name": "Cash",
  "type": "Asset|Liability|Equity|Revenue|Expense|COGS",
  "isDisallowable": false,
  "isNonTaxable": false,
  "isRevenue": false,
  "isRent": false,
  "rentFrequency": "Monthly|Quarterly|Annually"
}
```

#### Update Account
```
PUT /api/businesses/:businessId/accounts/:accountId
Body: { ...updated fields }
```

#### Delete Account
```
DELETE /api/businesses/:businessId/accounts/:accountId
```

### Transactions

#### Get All Transactions
```
GET /api/businesses/:businessId/transactions?startDate=...&endDate=...&type=...
Response: { "transactions": [...] }
```

#### Create Transaction
```
POST /api/businesses/:businessId/transactions
Body: {
  "accountId": "uuid",
  "contactId": "uuid",
  "type": "receipt|payment|inventory_purchase|inventory_sale|fixed_purchase|fixed_disposal|depreciation|salary",
  "date": "2024-01-01",
  "description": "...",
  "amount": 10000,
  "vatRate": 7.5,
  "vatInclusive": false,
  "whtRate": 5,
  "whtMode": "gross|net",
  "files": ["url1", "url2"],
  "referenceNumber": "...",
  "notes": "..."
}
```

#### Get Transaction by ID
```
GET /api/businesses/:businessId/transactions/:transactionId
Response: { "transaction": {...} }
```

### Fixed Assets

#### Get All Fixed Assets
```
GET /api/businesses/:businessId/fixed-assets
Response: { "assets": [...] }
```

#### Create Fixed Asset
```
POST /api/businesses/:businessId/fixed-assets
Body: {
  "name": "Asset Name",
  "description": "...",
  "assetTag": "ASSET-001",
  "purchaseDate": "2024-01-01",
  "cost": 5000000,
  "depreciationRate": 10,
  "capitalAllowanceRate": 25,
  "isChargeable": "FIXED|CHARGEABLE",
  "openingBalance": false
}
```

#### Get Fixed Asset by ID
```
GET /api/businesses/:businessId/fixed-assets/:assetId
Response: { "asset": {...} }
```

#### Dispose Fixed Asset
```
POST /api/businesses/:businessId/fixed-assets/:assetId/dispose
Body: {
  "disposalDate": "2024-06-01",
  "disposalAmount": 4000000
}
Response: { "asset": {...}, "gainLoss": {...} }
```

### Inventory

#### Get All Inventory Items
```
GET /api/businesses/:businessId/inventory
Response: { "items": [...] }
```

#### Create Inventory Item
```
POST /api/businesses/:businessId/inventory
Body: {
  "name": "Product Name",
  "sku": "SKU-001",
  "description": "...",
  "costingMethod": "weighted-average|FIFO|LIFO",
  "sellingPrice": 1500
}
```

#### Purchase Inventory
```
POST /api/businesses/:businessId/inventory/:itemId/purchase
Body: {
  "quantity": 100,
  "unitCost": 1000,
  "transactionId": "uuid" (optional)
}
```

#### Sell Inventory
```
POST /api/businesses/:businessId/inventory/:itemId/sell
Body: {
  "quantity": 50,
  "transactionId": "uuid" (optional)
}
```

#### Get Inventory Transactions
```
GET /api/businesses/:businessId/inventory/:itemId/transactions
Response: { "transactions": [...] }
```

### Contacts

#### Get All Contacts
```
GET /api/businesses/:businessId/contacts?type=Customer|Supplier|Employee|Other
Response: { "contacts": [...] }
```

#### Create Contact
```
POST /api/businesses/:businessId/contacts
Body: {
  "name": "Contact Name",
  "type": "Customer|Supplier|Employee|Other",
  "email": "...",
  "phone": "...",
  "address": "...",
  "taxId": "...",
  "isEmployee": false,
  "basicSalary": 0,
  "housingAllowance": 0,
  "transportAllowance": 0,
  "otherAllowances": 0,
  "nhfContribution": 0,
  "pensionContribution": 0,
  "lifeAssurance": 0,
  "mortgageInterest": 0,
  "rentPaid": 0
}
```

#### Get Contact by ID
```
GET /api/businesses/:businessId/contacts/:contactId
Response: { "contact": {...} }
```

#### Update Contact
```
PUT /api/businesses/:businessId/contacts/:contactId
Body: { ...updated fields }
```

### Tax Computations

#### Compute Tax
```
GET /api/businesses/:businessId/tax/compute?startDate=2024-01-01&endDate=2024-12-31
Response: {
  "period": {...},
  "revenue": 10000000,
  "cogs": 6000000,
  "expenses": 2000000,
  "depreciation": 500000,
  "accountingProfit": 1500000,
  "adjustments": {...},
  "taxableProfit": 1250000,
  "tax": {...},
  "vat": {...},
  "wht": {...}
}
```

#### Compute PAYE for Contact
```
GET /api/businesses/:businessId/tax/paye/:contactId
Response: {
  "contact": {...},
  "monthly": {...},
  "annual": {...}
}
```

### Depreciation

#### Manual Depreciation Run
```
POST /api/depreciation/run
Response: { "message": "Depreciation run completed", "result": [...] }
```

## Error Responses

All endpoints may return error responses in the format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Role-Based Access Control

Different roles have different permissions:

- **Viewer**: Can view all data, cannot create/update/delete
- **Accountant**: Can manage transactions, inventory, contacts; cannot manage users or settings
- **Manager**: Can do everything Accountant can, plus manage chart of accounts and fixed assets
- **Admin**: Full access including user management, business settings, and invitations

## Rate Limiting

Currently not implemented in MVP.

## Pagination

Currently not implemented for list endpoints in MVP. All results are returned.

## File Upload Constraints

- Max file size: 10MB
- Allowed types: Images (image/*) and PDFs (application/pdf)
- Multiple files: Max 10 files per request
