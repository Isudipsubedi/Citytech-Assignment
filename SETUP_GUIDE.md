## 📖 Detailed Setup Guide

## Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Docker** and **Docker Compose**  or use postgres locally (for PostgreSQL database)
- **Maven** (or use `./mvnw` wrapper included in backend)


### Manual Setup (Step-by-Step)

### Step 1: Start PostgreSQL Database

**Option A: Using Docker Compose (Recommended)**

```bash
# From the root directory (where docker-compose.yml is located)
docker-compose up -d postgres

# Verify database is running
docker ps
```

**Note:** Docker Compose uses port `5444` and credentials `admin/admin`. If using this, you'll need to update `application.yml` or use environment variables.

**Option B: Using Local PostgreSQL**

If you have PostgreSQL installed locally:

```bash
# Start PostgreSQL service (varies by OS)
# Windows: Start PostgreSQL service from Services
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql
```

<!-- In the backend D:\CT\Citytech-Assignment\part3-backend-challenge\src\main\resources\application.yml
Put the DB_PASSWORD as you have set

datasources:
  default:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:payment_platform}
    driverClassName: org.postgresql.Driver
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:1415} -->


### Step 2: Setup Database Schema and Data

**If using Docker Compose (port 5444):**

```bash
# Navigate to database challenge directory
cd part1-database-challenge

# Create base schema (members, transactions tables)
psql -U admin -h localhost -p 5444 -d payment_platform -f schema.sql
psql -U admin -h localhost -p 5444 -d payment_platform -f sample-data.sql

# Navigate to backend directory
cd ../part3-backend-challenge

# Create merchants table and sample data
psql -U admin -h localhost -p 5444 -d payment_platform -f merchants-schema.sql
psql -U admin -h localhost -p 5444 -d payment_platform -f merchants-sample-data.sql
```

**If using Local PostgreSQL (port 5432, default):**

```bash
# Navigate to database challenge directory
cd part1-database-challenge

# Create base schema (members, transactions tables)
psql -U postgres -h localhost -d payment_platform -f schema.sql
psql -U postgres -h localhost -d payment_platform -f sample-data.sql

# Navigate to backend directory
cd ../part3-backend-challenge

# Create merchants table and sample data
psql -U postgres -h localhost -d payment_platform -f merchants-schema.sql
psql -U postgres -h localhost -d payment_platform -f merchants-sample-data.sql
```

**Note:** If you get a connection error, wait a few seconds for PostgreSQL to fully start, then try again.

### Step 3: Start Backend API

```bash
# Make sure you're in the backend directory
cd part3-backend-challenge

# Build the project (first time only, or after code changes)
mvn clean install

# Start the backend server
mvn mn:run
```

**Expected output:**
```
|  \/  (_) ___ _ __ ___  _ __   __ _ _   _| |_
| |\/| | |/ __| '__/ _ \| '_ \ / _` | | | | __|
| |  | | | (__| | | (_) | | | | (_| | |_| | |_
|_|  |_|_|\___|_|  \___/|_| |_|\__,_|\__,_|\__|
  Micronaut (v4.x.x)

Started Application in X.XXX seconds.
Server Running: http://localhost:8080
```

**Verify backend is running:**
```bash
# In a new terminal, test the health endpoint
curl http://localhost:8080/health

# Or open in browser
# http://localhost:8080/health
```

### Step 4: Start Frontend Application

```bash
# Open a NEW terminal window/tab
# Navigate to frontend directory
cd part4-frontend-challenge

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 5: Access the Application

1. **Frontend:** Open http://localhost:3000 in your browser
2. **Backend API:** http://localhost:8080
3. **Health Check:** http://localhost:8080/health

## Detailed Setup Instructions

### Database Configuration

The database connection is configured in `part3-backend-challenge/src/main/resources/application.yml`:

```yaml
datasources:
  default:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:payment_platform}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:"password you set"}
```

**Default values (for local PostgreSQL):**
- Host: `localhost`
- Port: `5432`
- Database: `payment_platform`
- Username: `postgres`
- Password: `password you set`

**If using Docker Compose:**
Set environment variables before starting backend:
```bash
export DB_HOST=localhost
export DB_PORT=5444
export DB_USER=admin
export DB_PASSWORD=admin
export DB_NAME=payment_platform
```

**Or update `application.yml` directly:**
- Change port to `5444` and credentials to `admin/admin`

### Backend Configuration

**Port:** Default is `8080` (configured in `application.yml`)

**CORS:** Already configured to allow requests from `http://localhost:3000`

**To change backend port:**
```yaml
# In application.yml
micronaut:
  server:
    port: 8080  # Change this
```

### Frontend Configuration

**API Base URL:** Configured in `src/services/api.ts`

Default: `http://localhost:8080/api/v1`

**To change API URL:**
1. Create `.env` file in `part4-frontend-challenge/`:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```
2. Restart the dev server

**Vite Proxy:** Already configured in `vite.config.ts` to proxy `/api` requests to backend

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms:** Backend fails to start with database connection error

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   docker ps
   ```
2. Check database credentials in `application.yml`
3. Wait a few seconds after starting Docker container
4. Verify database exists:
   ```bash
   psql -U postgres -h localhost -c "\l" | grep payment_platform
   ```

### Issue: Backend Won't Start

**Symptoms:** Maven build fails or application crashes

**Solutions:**
1. Check Java version: `java -version` (should be 17+)
2. Clean and rebuild:
   ```bash
   ./mvnw clean install
   ```
3. Check logs for specific error messages
4. Verify all dependencies are downloaded

### Issue: Frontend Can't Connect to Backend

**Symptoms:** Network errors in browser console, "Failed to load merchants"

**Solutions:**
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check CORS configuration in backend `application.yml`
3. Verify API URL in frontend `src/services/api.ts`
4. Check browser console for specific error messages
5. Try accessing backend directly: http://localhost:8080/api/v1/merchants?page=1&size=20

### Issue: No Merchants Showing

**Symptoms:** Frontend loads but shows empty list

**Solutions:**
1. Verify merchants table exists:
   ```bash
   psql -U postgres -h localhost -d payment_platform -c "SELECT COUNT(*) FROM operators.merchants;"
   ```
2. If count is 0, run the sample data script again:
   ```bash
   psql -U postgres -h localhost -d payment_platform -f merchants-sample-data.sql
   ```
3. Check backend logs for errors
4. Test API directly: `curl http://localhost:8080/api/v1/merchants?page=1&size=20`

## Running in Production Mode

### Backend

```bash
# Build JAR
./mvnw clean package

# Run JAR
java -jar target/payment-api-1.0.0.jar
```

### Frontend

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Workflow

1. **Start Database:** `docker-compose up -d postgres` (run once)
2. **Start Backend:** `./mvnw mn:run` (in backend directory)
3. **Start Frontend:** `npm run dev` (in frontend directory, new terminal)
4. **Make Changes:** Edit code, both servers auto-reload
5. **Test:** Open http://localhost:3000

## Stopping Everything

```bash
# Stop frontend: Ctrl+C in frontend terminal
# Stop backend: Ctrl+C in backend terminal
# Stop database:
docker-compose down
```

## Verification Checklist

- [ ] PostgreSQL container is running (`docker ps`)
- [ ] Database schema created (check with `psql`)
- [ ] Merchants table has data (50 sample merchants)
- [ ] Backend starts without errors
- [ ] Backend health check works: `curl http://localhost:8080/health`
- [ ] Frontend starts without errors
- [ ] Frontend can access backend API
- [ ] Merchants list displays in browser

## API Endpoints Reference

Once everything is running, you can test these endpoints:

```bash
# Health check
curl http://localhost:8080/health

# Get merchants (paginated)
curl "http://localhost:8080/api/v1/merchants?page=1&size=20"

# Get merchant by ID
curl http://localhost:8080/api/v1/merchants/MCH-00001

# Create merchant
curl -X POST http://localhost:8080/api/v1/merchants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Merchant","email":"test@example.com","phone":"+1-555-0100","status":"active"}'

# Update merchant
curl -X PUT http://localhost:8080/api/v1/merchants/MCH-00001 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","email":"updated@example.com","phone":"+1-555-0100","status":"active"}'

# Delete merchant
curl -X DELETE http://localhost:8080/api/v1/merchants/MCH-00001
```

## Next Steps

1. **Access Swagger UI:** http://localhost:8080/swagger-ui
2. **View API Documentation:** All endpoints are documented with OpenAPI
3. **Test Frontend:** Navigate to http://localhost:3000/merchants
4. **Add Merchants:** Use the "Add New Merchant" button
5. **Edit/Delete:** Use the action buttons in the merchant list

---

**Need Help?** Check the logs:
- Backend logs: Terminal where `./mvnw mn:run` is running
- Frontend logs: Browser console (F12)
- Database logs: `docker logs <container-name>`

