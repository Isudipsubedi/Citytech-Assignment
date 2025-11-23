# Payment Platform - System Design & Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [API Structure](#api-structure)
7. [Data Flow](#data-flow)
8. [Module Interactions](#module-interactions)
9. [Complete Setup Guide](#complete-setup-guide)
10. [Database Setup & Data Insertion](#database-setup--data-insertion)

---

## System Overview

The Payment Platform is a full-stack application for managing merchants and their payment transactions. It consists of:

- **Frontend**: React + TypeScript application (Port 3000)
- **Backend**: Micronaut Java application (Port 8080)
- **Database**: PostgreSQL (Port 5432)
- **Architecture**: Layered architecture with clear separation of concerns

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Micronaut 4, Java 17, Maven |
| Database | PostgreSQL 14 |
| API Communication | RESTful APIs, JSON |
| Build Tools | Maven (Backend), npm (Frontend) |

---

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser (Port 3000)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Frontend Application                    │  │
│  │  - Merchant Management UI                             │  │
│  │  - Transaction Viewing                                 │  │
│  │  - Role-Based Access Control                          │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
                        │ (CORS Enabled)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Server (Port 8080)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Micronaut Application                         │  │
│  │  ┌──────────────┐  ┌──────────────┐                   │  │
│  │  │ Controllers │  │   Services   │                   │  │
│  │  └──────┬──────┘  └──────┬───────┘                   │  │
│  │         │                │                           │  │
│  │  ┌──────▼────────────────▼───────┐                   │  │
│  │  │      Repositories             │                   │  │
│  │  └──────────────┬────────────────┘                   │  │
│  └─────────────────┼────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │ JDBC
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         PostgreSQL Database (Port 5432)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Schema: operators                                    │  │
│  │  ├── merchants                                        │  │
│  │  ├── transaction_master                             │  │
│  │  ├── transaction_details                             │  │
│  │  └── members                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### System Components

1. **Frontend (React)**
   - User interface for merchant management
   - Transaction viewing and filtering
   - Role-based access control
   - Real-time data updates

2. **Backend (Micronaut)**
   - RESTful API endpoints
   - Business logic processing
   - Data validation and error handling
   - Database access layer

3. **Database (PostgreSQL)**
   - Persistent data storage
   - Transactional integrity
   - Indexed queries for performance

---

## Database Schema

### Schema: `operators`

The database uses a schema named `operators` to organize all payment-related tables.

### Entity Relationship Diagram

```
┌─────────────────┐
│    merchants    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email           │
│ phone           │
│ business_name   │
│ registration_no │
│ address         │
│ city            │
│ country         │
│ status          │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────────┐
│ transaction_master  │
├──────────────────────┤
│ txn_id (PK)         │
│ merchant_id (FK)    │◄─────┐
│ gp_acquirer_id (FK) │      │
│ gp_issuer_id (FK)   │      │
│ txn_date            │      │
│ local_txn_date_time │      │
│ amount              │      │
│ currency            │      │
│ status              │      │
│ card_type           │      │
│ card_last4          │      │
│ auth_code           │      │
│ response_code       │      │
│ created_at          │      │
└──────────┬───────────┘      │
           │                  │
           │ 1:N              │
           │                  │
           ▼                  │
┌──────────────────────┐      │
│ transaction_details  │      │
├──────────────────────┤      │
│ txn_detail_id (PK)  │      │
│ master_txn_id (FK)  │      │
│ detail_type          │      │
│ amount               │      │
│ currency             │      │
│ description          │      │
│ local_txn_date_time  │      │
│ created_at           │      │
└──────────────────────┘      │
                              │
                              │
┌─────────────────┐           │
│    members      │           │
├─────────────────┤           │
│ member_id (PK)  │───────────┘
│ member_name     │
│ member_type     │
│ member_code     │
│ country         │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### Table Definitions

#### 1. `merchants` Table

**Purpose**: Stores merchant account information and registration details.

**Columns**:
- `id` (VARCHAR(50), PK) - Unique merchant identifier (e.g., MCH-00001)
- `name` (VARCHAR(255), NOT NULL) - Merchant contact name
- `email` (VARCHAR(255), NOT NULL) - Merchant email address
- `phone` (VARCHAR(50), NOT NULL) - Merchant phone number
- `business_name` (VARCHAR(255)) - Business/company name
- `registration_number` (VARCHAR(100)) - Business registration number
- `address` (TEXT) - Street address
- `city` (VARCHAR(100)) - City name
- `country` (VARCHAR(100)) - Country name
- `status` (VARCHAR(20), DEFAULT 'active') - Merchant status (active/inactive)
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp

**Indexes**:
- Primary Key: `id`
- Index on `status` for filtering
- Index on `email` for lookups
- Index on `created_at` for sorting

**Constraints**:
- `status` must be 'active' or 'inactive'

#### 2. `transaction_master` Table

**Purpose**: Primary transaction records - header level information.

**Columns**:
- `txn_id` (BIGSERIAL, PK) - Unique transaction identifier
- `merchant_id` (VARCHAR(50), NOT NULL) - Foreign key to merchants.id
- `gp_acquirer_id` (BIGINT, FK) - Foreign key to members.member_id
- `gp_issuer_id` (BIGINT, FK) - Foreign key to members.member_id
- `txn_date` (DATE, NOT NULL) - Transaction date
- `local_txn_date_time` (TIMESTAMP WITH TIME ZONE, NOT NULL) - Transaction timestamp
- `amount` (DECIMAL(15,2), NOT NULL) - Transaction amount
- `currency` (VARCHAR(3), DEFAULT 'USD') - Currency code
- `status` (VARCHAR(20), NOT NULL) - Transaction status
- `card_type` (VARCHAR(20)) - Card brand (VISA, MasterCard, etc.)
- `card_last4` (VARCHAR(4)) - Last 4 digits of card
- `auth_code` (VARCHAR(20)) - Authorization code
- `response_code` (VARCHAR(10)) - Response code from gateway
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Record creation timestamp

**Indexes**:
- Primary Key: `txn_id`
- Index on `merchant_id` for merchant queries
- Index on `txn_date` for date range queries

**Constraints**:
- `status` must be one of: 'pending', 'completed', 'failed', 'reversed'
- Foreign key to `merchants(id)`
- Foreign keys to `members(member_id)`

#### 3. `transaction_details` Table

**Purpose**: Detail records for each transaction (fees, taxes, adjustments).

**Columns**:
- `txn_detail_id` (BIGSERIAL, PK) - Unique detail identifier
- `master_txn_id` (BIGINT, NOT NULL, FK) - Foreign key to transaction_master.txn_id
- `detail_type` (VARCHAR(50), NOT NULL) - Type of detail
- `amount` (DECIMAL(15,2), NOT NULL) - Detail amount
- `currency` (VARCHAR(3), DEFAULT 'USD') - Currency code
- `description` (TEXT) - Description of the detail
- `local_txn_date_time` (TIMESTAMP WITH TIME ZONE, NOT NULL) - Detail timestamp
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Record creation timestamp

**Indexes**:
- Primary Key: `txn_detail_id`
- Index on `master_txn_id` for joining with transaction_master

**Constraints**:
- `detail_type` must be one of: 'fee', 'tax', 'adjustment', 'refund', 'chargeback'
- Foreign key to `transaction_master(txn_id)`

#### 4. `members` Table

**Purpose**: Stores acquirer and issuer member information.

**Columns**:
- `member_id` (BIGSERIAL, PK) - Unique member identifier
- `member_name` (VARCHAR(255), NOT NULL) - Member name
- `member_type` (VARCHAR(20), NOT NULL) - Type: 'acquirer', 'issuer', or 'both'
- `member_code` (VARCHAR(20), UNIQUE, NOT NULL) - Member code
- `country` (VARCHAR(3), NOT NULL) - Country code
- `status` (VARCHAR(20), DEFAULT 'active') - Member status
- `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Record creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW()) - Last update timestamp

**Indexes**:
- Primary Key: `member_id`
- Unique index on `member_code`

**Constraints**:
- `member_type` must be 'acquirer', 'issuer', or 'both'

---

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│            Controller Layer                     │
│  - MerchantController                           │
│  - TransactionController                        │
│  - HealthController                             │
│  Responsibilities:                              │
│  • HTTP request handling                        │
│  • Parameter validation                         │
│  • Response formatting                          │
│  • OpenAPI documentation                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│             Service Layer                       │
│  - MerchantService / MerchantServiceImpl       │
│  - TransactionService / TransactionServiceImpl │
│  Responsibilities:                              │
│  • Business logic                               │
│  • Data transformation                          │
│  • Validation                                    │
│  • Error handling                                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            Repository Layer                      │
│  - MerchantRepository                           │
│  - TransactionRepository                        │
│  - TransactionDetailRepository                  │
│  - MemberRepository                             │
│  Responsibilities:                              │
│  • Database queries                             │
│  • Data persistence                             │
│  • Pagination                                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            Entity Layer                          │
│  - Merchant                                      │
│  - TransactionMaster                            │
│  - TransactionDetail                            │
│  - Member                                        │
│  Responsibilities:                              │
│  • Data model definition                        │
│  • Database mapping                             │
└─────────────────────────────────────────────────┘
```

### Backend Package Structure

```
com.payment/
├── Application.java                 # Main application entry point
├── config/
│   └── CorsFilter.java              # CORS configuration
├── controller/
│   ├── MerchantController.java      # Merchant CRUD endpoints
│   ├── TransactionController.java   # Transaction query endpoints
│   └── HealthController.java        # Health check endpoint
├── service/
│   ├── MerchantService.java         # Merchant service interface
│   ├── MerchantServiceImpl.java    # Merchant service implementation
│   ├── TransactionService.java      # Transaction service interface
│   └── TransactionServiceImpl.java # Transaction service implementation
├── repository/
│   ├── MerchantRepository.java      # Merchant data access
│   ├── TransactionRepository.java   # Transaction data access
│   ├── TransactionDetailRepository.java # Transaction detail access
│   └── MemberRepository.java        # Member data access
├── entity/
│   ├── Merchant.java                # Merchant entity
│   ├── TransactionMaster.java       # Transaction entity
│   ├── TransactionDetail.java       # Transaction detail entity
│   └── Member.java                  # Member entity
├── dto/
│   ├── MerchantRequest.java          # Merchant create/update DTO
│   ├── MerchantResponse.java         # Merchant response DTO
│   ├── PaginatedResponse.java       # Pagination wrapper
│   ├── TransactionResponse.java     # Transaction response DTO
│   ├── TransactionDetailResponse.java # Transaction detail DTO
│   ├── TransactionSummary.java      # Summary statistics DTO
│   ├── DateRange.java               # Date range DTO
│   ├── MerchantTransactionsResponse.java # Complete transaction response
│   └── PaginationInfo.java          # Pagination metadata
└── exception/
    ├── NotFoundException.java        # Custom not found exception
    └── GlobalExceptionHandler.java  # Global error handler
```

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx
├── Header (Navigation, User Info)
├── Routes
│   ├── /login → Login Component
│   ├── /merchants → Merchants Page
│   │   ├── MerchantList
│   │   │   ├── Search/Filter Controls
│   │   │   ├── Merchant Table
│   │   │   └── Pagination
│   │   ├── MerchantForm (Modal)
│   │   ├── MerchantDetails (Modal)
│   │   │   ├── Merchant Profile
│   │   │   ├── Transaction Statistics
│   │   │   ├── Recent Transactions
│   │   │   └── Activity Timeline
│   │   └── ConfirmDialog
│   └── /transactions → Transactions Page
└── Notification (Toast Messages)
```

### Frontend Package Structure

```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Main app component with routing
├── components/
│   ├── auth/
│   │   └── Login.tsx          # Login component
│   ├── common/
│   │   ├── Button.tsx         # Reusable button
│   │   ├── Input.tsx          # Reusable input
│   │   ├── Card.tsx           # Card container
│   │   ├── Table.tsx          # Table component
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   ├── ConfirmDialog.tsx  # Confirmation modal
│   │   └── Notification.tsx  # Toast notifications
│   ├── layout/
│   │   └── Header.tsx         # App header
│   └── merchants/
│       ├── MerchantList.tsx   # Merchant list table
│       ├── MerchantForm.tsx   # Add/Edit merchant form
│       └── MerchantDetails.tsx # Merchant details view
├── pages/
│   ├── Merchants.tsx          # Merchants page
│   └── Transactions.tsx      # Transactions page
├── services/
│   ├── api.ts                # API client configuration
│   ├── merchantService.ts    # Merchant API calls
│   └── transactionService.ts # Transaction API calls
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── types/
│   ├── merchant.ts           # Merchant type definitions
│   └── transaction.ts        # Transaction type definitions
└── utils/
    ├── constants.ts          # Application constants
    └── formatters.ts         # Formatting utilities
```

---

## API Structure

### Base URL
```
http://localhost:8080/api/v1
```

### Merchant Endpoints

#### 1. Get All Merchants
```
GET /api/v1/merchants
Query Parameters:
  - page (integer, default: 1) - Page number (1-based)
  - size (integer, default: 20) - Page size
  - search (string, optional) - Search term (name, ID, email)
  - status (string, optional) - Filter by status (active/inactive)

Response: 200 OK
{
  "data": [MerchantResponse],
  "totalCount": 50,
  "totalPages": 3,
  "currentPage": 1,
  "pageSize": 20
}
```

#### 2. Get Merchant by ID
```
GET /api/v1/merchants/{id}

Response: 200 OK
MerchantResponse

Error: 404 Not Found
{
  "error": "Merchant not found with ID: {id}"
}
```

#### 3. Create Merchant
```
POST /api/v1/merchants
Body: MerchantRequest

Response: 201 Created
MerchantResponse

Error: 400 Bad Request (validation errors)
```

#### 4. Update Merchant
```
PUT /api/v1/merchants/{id}
Body: MerchantRequest

Response: 200 OK
MerchantResponse

Error: 404 Not Found, 400 Bad Request
```

#### 5. Delete Merchant
```
DELETE /api/v1/merchants/{id}

Response: 204 No Content

Error: 404 Not Found
```

### Transaction Endpoints

#### 1. Get Merchant Transactions
```
GET /api/v1/merchants/{merchantId}/transactions
Query Parameters:
  - page (integer, default: 0) - Page number (0-based)
  - size (integer, default: 20) - Page size
  - startDate (string, optional) - Start date (ISO or YYYY-MM-DD)
  - endDate (string, optional) - End date (ISO or YYYY-MM-DD)
  - status (string, optional) - Filter by status

Response: 200 OK
{
  "merchantId": "MCH-00001",
  "dateRange": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-18T23:59:59Z"
  },
  "summary": {
    "totalTransactions": 1523,
    "totalAmount": 245670.50,
    "currency": "USD",
    "byStatus": {
      "completed": 1450,
      "pending": 50,
      "failed": 23
    }
  },
  "transactions": [TransactionResponse],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalPages": 77,
    "totalElements": 1523
  }
}
```

### Health Check
```
GET /health

Response: 200 OK
{
  "status": "UP"
}
```

---

## Data Flow

### Merchant Creation Flow

```
User Input (Frontend)
    │
    ▼
MerchantForm Component
    │
    ▼
merchantService.createMerchant()
    │
    ▼
HTTP POST /api/v1/merchants
    │
    ▼
MerchantController.createMerchant()
    │
    ▼
MerchantService.createMerchant()
    │
    ├─ Validate input
    ├─ Generate merchant ID
    ├─ Check email uniqueness
    │
    ▼
MerchantRepository.save()
    │
    ▼
PostgreSQL INSERT INTO merchants
    │
    ▼
Return MerchantResponse
    │
    ▼
Frontend displays success notification
```

### Transaction Retrieval Flow

```
User clicks "View Details" (Frontend)
    │
    ▼
MerchantDetails Component
    │
    ▼
transactionService.getTransactions()
    │
    ▼
HTTP GET /api/v1/merchants/{id}/transactions?page=0&size=10
    │
    ▼
TransactionController.getTransactions()
    │
    ├─ Validate merchant exists
    ├─ Parse date parameters
    ├─ Validate pagination
    │
    ▼
TransactionService.getMerchantTransactions()
    │
    ├─ Fetch transactions (paginated)
    ├─ Fetch transaction details
    ├─ Fetch member names (acquirer/issuer)
    ├─ Calculate summary statistics
    │
    ▼
TransactionRepository.findByMerchantId()
    │
    ▼
PostgreSQL SELECT with JOINs
    │
    ▼
Map entities to DTOs
    │
    ▼
Return MerchantTransactionsResponse
    │
    ▼
Frontend displays transactions in table
```

---

## Module Interactions

### Request Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐
│  React Frontend │
│  - Components   │
│  - Services     │
│  - Contexts     │
└──────┬──────────┘
       │ REST API Call
       │ (via axios)
       ▼
┌─────────────────┐
│  CORS Filter    │
│  - OPTIONS      │
│  - Headers      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Controller    │
│  - Validation   │
│  - Binding      │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│    Service      │
│  - Business     │
│  - Logic        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Repository    │
│  - Queries     │
│  - Mapping     │
└──────┬─────────┘
       │ JDBC
       ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

---

## Complete Setup Guide

### Prerequisites

1. **Java 17+** - For backend
2. **Node.js 18+** and **npm** - For frontend
3. **PostgreSQL 14+** - Database server
4. **Maven** (or use included `mvnw` wrapper)

### Step 1: Install PostgreSQL

#### Windows:
1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Set password (remember this for connection)
4. Default port: 5432

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Mac:
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE payment_platform;

# Verify creation
\l

# Exit
\q
```

### Step 3: Setup Database Schema

```bash
# Navigate to database challenge directory
cd part1-database-challenge

# Create base schema (members, transactions)
psql -U postgres -h localhost -d payment_platform -f schema.sql

# Insert sample data
psql -U postgres -h localhost -d payment_platform -f sample-data.sql

# Navigate to backend directory
cd ../part3-backend-challenge

# Create merchants table
psql -U postgres -h localhost -d payment_platform -f merchants-schema.sql

# Insert merchant sample data
psql -U postgres -h localhost -d payment_platform -f merchants-sample-data.sql
```

### Step 4: Configure Backend

Edit `part3-backend-challenge/src/main/resources/application.yml`:

```yaml
datasources:
  default:
    url: jdbc:postgresql://localhost:5432/payment_platform
    username: postgres
    password: YOUR_PASSWORD_HERE  # Change this
```

Or set environment variables:
```bash
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=payment_platform
```

### Step 5: Start Backend

```bash
cd part3-backend-challenge

# Build project
mvn clean install

# Run application
mvn mn:run
```

**Expected Output:**
```
|  \/  (_) ___ _ __ ___  _ __   __ _ _   _| |_
| |\/| | |/ __| '__/ _ \| '_ \ / _` | | | | __|
| |  | | | (__| | | (_) | | | | (_| | |_| | |_
|_|  |_|_|\___|_|  \___/|_| |_|\__,_|\__,_|\__|
  Micronaut (v4.x.x)

Started Application in X.XXX seconds.
Server Running: http://localhost:8080
```

### Step 6: Start Frontend

```bash
# Open new terminal
cd part4-frontend-challenge

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

### Step 7: Verify Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Test Merchant API:**
   ```bash
   curl "http://localhost:8080/api/v1/merchants?page=1&size=20"
   ```

3. **Test Transaction API:**
   ```bash
   curl "http://localhost:8080/api/v1/merchants/MCH-00001/transactions?page=0&size=10"
   ```

4. **Access Swagger UI:**
   - Open: http://localhost:8080/swagger-ui

5. **Access Frontend:**
   - Open: http://localhost:3000

---

## Database Setup & Data Insertion

### Initial Schema Creation

The database schema is created in the following order:

1. **Create Schema:**
   ```sql
   CREATE SCHEMA IF NOT EXISTS operators;
   ```

2. **Create Tables:**
   - `members` - Acquirer/issuer information
   - `transaction_master` - Main transaction records
   - `transaction_details` - Transaction detail records
   - `merchants` - Merchant information

### Sample Data Insertion

#### Merchants Data

50 sample merchants are inserted with IDs from `MCH-00001` to `MCH-00050`.

**Example Merchant Record:**
```sql
INSERT INTO operators.merchants (id, name, email, phone, business_name, registration_number, address, city, country, status, created_at, updated_at) 
VALUES 
('MCH-00001', 'John Smith', 'john.smith@example.com', '+1-555-0101', 'Smith Electronics', 'REG-2024-001', '123 Main Street', 'New York', 'United States', 'active', '2024-01-15 10:00:00+00', '2024-11-20 14:30:00+00');
```

#### Transaction Data

Transactions are linked to merchants via `merchant_id` field.

**Example Transaction Record:**
```sql
INSERT INTO operators.transaction_master (merchant_id, gp_acquirer_id, gp_issuer_id, txn_date, local_txn_date_time, amount, currency, status, card_type, card_last4, auth_code, response_code) 
VALUES 
('MCH-00001', 1, 2, '2025-11-18', '2025-11-18T14:32:15Z', 150.00, 'USD', 'completed', 'VISA', '4242', 'AUTH123', '00');
```

**Example Transaction Detail:**
```sql
INSERT INTO operators.transaction_details (master_txn_id, detail_type, amount, currency, description, local_txn_date_time) 
VALUES 
(98765, 'fee', 3.50, 'USD', 'Processing fee', '2025-11-18T14:32:15Z');
```

### Data Relationships

1. **Merchant → Transactions**: One merchant has many transactions
   - Foreign Key: `transaction_master.merchant_id` → `merchants.id`

2. **Transaction → Details**: One transaction has many details
   - Foreign Key: `transaction_details.master_txn_id` → `transaction_master.txn_id`

3. **Transaction → Members**: Transactions reference acquirer and issuer
   - Foreign Keys: `transaction_master.gp_acquirer_id` → `members.member_id`
   - Foreign Keys: `transaction_master.gp_issuer_id` → `members.member_id`

---

## System Flow Examples

### Example 1: Viewing Merchant Transactions

```
1. User clicks "View" icon on merchant row
   ↓
2. Frontend: MerchantDetails component opens
   ↓
3. Frontend: Calls transactionService.getTransactions(merchantId, {page: 0, size: 10})
   ↓
4. HTTP GET: /api/v1/merchants/MCH-00001/transactions?page=0&size=10
   ↓
5. Backend: TransactionController receives request
   ↓
6. Backend: TransactionService validates merchant exists
   ↓
7. Backend: TransactionRepository.findByMerchantId(merchantId, pageable)
   ↓
8. Database: SELECT * FROM transaction_master WHERE merchant_id = 'MCH-00001' LIMIT 10
   ↓
9. Backend: TransactionDetailRepository.findByMasterTxnIdInList([txnIds])
   ↓
10. Database: SELECT * FROM transaction_details WHERE master_txn_id IN (...)
   ↓
11. Backend: MemberRepository.findById() for acquirer/issuer names
   ↓
12. Backend: Calculate summary statistics
   ↓
13. Backend: Map entities to DTOs
   ↓
14. HTTP Response: 200 OK with MerchantTransactionsResponse
   ↓
15. Frontend: Display transactions in table with pagination
```

### Example 2: Creating a New Merchant

```
1. User clicks "Add New Merchant" button
   ↓
2. Frontend: MerchantForm modal opens
   ↓
3. User fills form and submits
   ↓
4. Frontend: Validates form data
   ↓
5. Frontend: Calls merchantService.createMerchant(formData)
   ↓
6. HTTP POST: /api/v1/merchants with MerchantRequest body
   ↓
7. Backend: MerchantController.createMerchant() receives request
   ↓
8. Backend: @Valid annotation validates request
   ↓
9. Backend: MerchantService.createMerchant()
   ↓
10. Backend: Generate merchant ID (MCH-XXXXX format)
   ↓
11. Backend: Check email uniqueness
   ↓
12. Backend: MerchantRepository.save(merchant)
   ↓
13. Database: INSERT INTO merchants VALUES (...)
   ↓
14. Database: Returns created merchant with timestamps
   ↓
15. Backend: Map entity to MerchantResponse DTO
   ↓
16. HTTP Response: 201 Created with MerchantResponse
   ↓
17. Frontend: Shows success notification
   ↓
18. Frontend: Refreshes merchant list
```

---

## API Request/Response Examples

### Create Merchant Request

```http
POST /api/v1/merchants HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "businessName": "Doe Enterprises",
  "registrationNumber": "REG-2024-051",
  "address": "456 Business Ave",
  "city": "San Francisco",
  "country": "United States",
  "status": "active"
}
```

**Response:**
```json
{
  "id": "MCH-00051",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "businessName": "Doe Enterprises",
  "registrationNumber": "REG-2024-051",
  "address": "456 Business Ave",
  "city": "San Francisco",
  "country": "United States",
  "status": "active",
  "createdAt": "2025-11-23T10:30:00Z",
  "updatedAt": "2025-11-23T10:30:00Z"
}
```

### Get Transactions Request

```http
GET /api/v1/merchants/MCH-00001/transactions?page=0&size=10&startDate=2025-11-01&endDate=2025-11-18&status=completed HTTP/1.1
Host: localhost:8080
```

**Response:**
```json
{
  "merchantId": "MCH-00001",
  "dateRange": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-18T23:59:59Z"
  },
  "summary": {
    "totalTransactions": 1523,
    "totalAmount": 245670.50,
    "currency": "USD",
    "byStatus": {
      "completed": 1450,
      "pending": 50,
      "failed": 23
    }
  },
  "transactions": [
    {
      "txnId": 98765,
      "amount": 150.00,
      "currency": "USD",
      "status": "completed",
      "timestamp": "2025-11-18T14:32:15Z",
      "cardType": "VISA",
      "cardLast4": "4242",
      "acquirer": "Global Payment Services",
      "issuer": "Visa Worldwide",
      "details": [
        {
          "detailId": 123,
          "type": "fee",
          "amount": 3.50,
          "description": "Processing fee"
        }
      ]
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalPages": 153,
    "totalElements": 1523
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "timestamp": "2025-11-23T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Merchant not found with ID: MCH-99999",
  "path": "/api/v1/merchants/MCH-99999"
}
```

### Common Error Codes

- **400 Bad Request**: Invalid input parameters, validation errors
- **404 Not Found**: Resource not found (merchant, transaction)
- **500 Internal Server Error**: Server-side errors

---

## Security Considerations

1. **CORS Configuration**: Configured for `http://localhost:3000`
2. **Input Validation**: All inputs validated at controller and service layers
3. **SQL Injection Prevention**: Using parameterized queries via Micronaut Data
4. **Error Messages**: Don't expose sensitive information

---

## Performance Considerations

1. **Database Indexes**: Created on frequently queried columns
2. **Pagination**: Implemented to limit data transfer
3. **Efficient Queries**: Uses Micronaut Data for optimized queries
4. **Connection Pooling**: Configured in `application.yml`

---

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms**: Backend fails to start with connection error

**Solutions**:
1. Verify PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
2. Check credentials in `application.yml`
3. Verify database exists: `psql -U postgres -l | grep payment_platform`
4. Check firewall settings

### Issue: CORS Errors

**Symptoms**: Frontend can't call backend API

**Solutions**:
1. Verify CORS is enabled in `application.yml`
2. Check `CorsFilter` handles OPTIONS requests
3. Verify frontend URL matches allowed origin
4. Check browser console for specific CORS error

### Issue: No Data Showing

**Symptoms**: API returns empty results

**Solutions**:
1. Verify data exists in database: `SELECT COUNT(*) FROM operators.merchants;`
2. Check merchant IDs match between merchants and transactions
3. Verify date ranges in queries
4. Check database logs for errors

---

## Next Steps

1. **Add Authentication**: Implement JWT-based authentication
2. **Add Caching**: Implement Redis for frequently accessed data
3. **Add Logging**: Enhanced logging and monitoring
4. **Add Tests**: Unit and integration tests
5. **Add CI/CD**: Automated deployment pipeline

---

## Diagrams

See the following diagram files in this directory:
- `system-architecture.puml` - High-level system architecture
- `database-schema.puml` - Database ER diagram
- `backend-layered-architecture.puml` - Backend layer structure
- `frontend-component-architecture.puml` - Frontend component structure
- `api-flow-diagram.puml` - API request flow
- `data-flow-diagram.puml` - Data flow diagrams

---

**Last Updated**: November 2025
**Version**: 1.0.0

---

## Settlement Processing - Detailed Design

Added companion pages and diagrams that specifically cover a scalable merchant settlement processing system capable of handling 10,000 merchants and ~5M transactions/day. Files added to this folder:

- `design-explanation.md` — 500–800 word design overview covering components, tech choices, data flow, scalability, failure handling, and trade-offs.
- `component-breakdown.md` — fine-grained responsibilities, APIs, and scaling notes for each component.
- `scalability-failure-handling.md` — detailed strategies for partitioning, autoscaling, idempotency, backpressure, and recovery.
- `tradeoffs.md` — explicit trade-offs (consistency vs availability, exactly-once vs simplicity, cost vs redundancy).
- `system_architecture.puml` — PlantUML component diagram showing ingestion, Kafka, stream processing, settlement engine, ledger, and notifications.
- `data_flow.puml` — PlantUML sequence diagram showing the daily settlement flow and idempotency checks.

Rendering notes:
- To render PlantUML diagrams locally, you can use the PlantUML jar or Docker image. Example (PowerShell):

```powershell
# With plantuml jar (download plantuml.jar)
java -jar plantuml.jar system_architecture.puml
java -jar plantuml.jar data_flow.puml

# Or using Docker (if plantuml image available):
docker run --rm -v ${PWD}:/workspace plantuml/plantuml -tpng /workspace/system_architecture.puml
```

If you want, I can render PNGs for these diagrams and commit them to the repo.

