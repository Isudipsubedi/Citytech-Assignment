# Part 3: Backend Development - REST API with Micronaut

**Time Estimate**: 60 minutes  
**Points**: 25/100

## Objective
Build a REST API endpoint for retrieving merchant transactions with filtering, pagination, and aggregation capabilities.

## What's Already Provided

This boilerplate includes:
- ✅ Micronaut project structure (Maven)
- ✅ Database configuration (PostgreSQL)
- ✅ Entity classes (MerchantTransaction, TransactionDetail, Member)
- ✅ Basic repository interfaces
- ✅ Application configuration
- ✅ Docker configuration
- ✅ Health check endpoint

## Your Task

Implement the following REST API endpoint:

```
GET /api/v1/merchants/{merchantId}/transactions
```

### Required Features

#### 1. Query Parameters
- `page` (integer, default: 0) - Page number
- `size` (integer, default: 20) - Page size
- `startDate` (date, ISO format) - Filter start date
- `endDate` (date, ISO format) - Filter end date
- `status` (string, optional) - Filter by transaction status

#### 2. Response Structure
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
    "size": 20,
    "totalPages": 77,
    "totalElements": 1523
  }
}
```

## Implementation Requirements

### 1. Controller Layer (`TransactionController.java`)
- [ ] Create `@Controller` for `/api/v1/merchants/{merchantId}/transactions`
- [ ] Implement GET endpoint with proper parameter binding
- [ ] Add input validation
- [ ] Return appropriate HTTP status codes
- [ ] Add OpenAPI/Swagger annotations

### 2. Service Layer (`TransactionService.java`)
- [ ] Implement business logic for transaction retrieval
- [ ] Calculate transaction summary (total, count by status)
- [ ] Handle timezone conversions (local → UTC)
- [ ] Apply date range filtering
- [ ] Implement pagination logic

### 3. Repository Layer (extend existing)
- [ ] Add custom query methods to `TransactionRepository`
- [ ] Implement efficient query for transactions with details
- [ ] Add aggregation query for summary calculation
- [ ] Use proper JPA/JDBC queries

### 4. DTO Layer (create as needed)
- [ ] Create request/response DTOs
- [ ] Implement proper mapping between entities and DTOs
- [ ] Handle null values gracefully

### 5. Error Handling
- [ ] Validate merchant exists
- [ ] Handle invalid date ranges
- [ ] Return meaningful error messages
- [ ] Use appropriate HTTP status codes (404, 400, 500)

### 6. Testing
- [ ] Write unit tests for service layer
- [ ] Test edge cases (no transactions, invalid dates, etc.)
- [ ] Minimum 70% code coverage for service layer

## Project Structure

```
part3-backend-challenge/
├── src/
│   ├── main/
│   │   ├── java/com/payment/
│   │   │   ├── Application.java                    ✅ Provided
│   │   │   ├── controller/
│   │   │   │   ├── HealthController.java          ✅ Provided
│   │   │   │   └── TransactionController.java     ⚠️  TODO: Implement
│   │   │   ├── service/
│   │   │   │   ├── TransactionService.java        ⚠️  TODO: Create interface
│   │   │   │   └── TransactionServiceImpl.java    ⚠️  TODO: Implement
│   │   │   ├── repository/
│   │   │   │   ├── TransactionRepository.java     ✅ Provided (extend as needed)
│   │   │   │   └── MemberRepository.java          ✅ Provided
│   │   │   ├── entity/
│   │   │   │   ├── TransactionMaster.java         ✅ Provided
│   │   │   │   ├── TransactionDetail.java         ✅ Provided
│   │   │   │   └── Member.java                    ✅ Provided
│   │   │   ├── dto/
│   │   │   │   ├── TransactionRequest.java        ⚠️  TODO: Create
│   │   │   │   ├── TransactionResponse.java       ⚠️  TODO: Create
│   │   │   │   └── ...                            ⚠️  TODO: Create as needed
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java    ✅ Provided
│   │   │       └── NotFoundException.java         ✅ Provided
│   │   └── resources/
│   │       ├── application.yml                     ✅ Provided
│   │       └── logback.xml                        ✅ Provided
│   └── test/
│       └── java/com/payment/
│           └── service/
│               └── TransactionServiceTest.java     ⚠️  TODO: Implement
├── pom.xml                                          ✅ Provided
├── Dockerfile                                       ✅ Provided
└── README.md                                        ✅ This file
```

## Getting Started

### 1. Setup Database

```bash
# Start PostgreSQL (if not using Codespaces)
docker-compose up -d postgres

# Run migrations
cd ../../part1-database-challenge
psql -U postgres -h localhost -d payment_platform -f schema.sql
psql -U postgres -h localhost -d payment_platform -f sample-data.sql

# Create merchants table and sample data
cd ../../part3-backend-challenge
psql -U postgres -h localhost -d payment_platform -f merchants-schema.sql
psql -U postgres -h localhost -d payment_platform -f merchants-sample-data.sql
```

### 2. Build & Run Application

```bash
# Build project
./mvnw clean install

# Run application
./mvnw mn:run

# Application will start at http://localhost:8080
```

### 3. Test Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Test your endpoint (once implemented)
curl "http://localhost:8080/api/v1/merchants/MCH-00001/transactions?page=0&size=20&startDate=2025-11-16&endDate=2025-11-18"
```

### 4. Access Swagger UI

Open browser: `http://localhost:8080/swagger-ui`

## Evaluation Criteria

### Code Quality (8 points)
- Clean, readable code
- Proper layering (Controller → Service → Repository)
- SOLID principles
- Consistent naming conventions

### API Design (5 points)
- RESTful design
- Proper HTTP methods and status codes
- Well-structured request/response DTOs
- Good endpoint naming

### Framework Usage (4 points)
- Proper use of Micronaut annotations
- Dependency injection
- Configuration management
- Compile-time features

### Validation & Error Handling (4 points)
- Input validation
- Proper exception handling
- Meaningful error messages
- Appropriate status codes

### Testing (4 points)
- Unit tests for service layer
- Edge case coverage
- Clear test structure
- Good assertions

## Tips

1. **Start Simple**: Get a basic endpoint working first, then add features
2. **Use Existing Code**: Look at HealthController for examples
3. **Test Frequently**: Run the application often to catch errors early
4. **Read Docs**: Micronaut documentation is excellent
5. **Focus on Core**: Bonus features are optional

## Common Pitfalls to Avoid

❌ Not validating input parameters  
❌ Returning entities directly (use DTOs)  
❌ Poor error messages  
❌ No pagination implementation  
❌ Ignoring timezone conversions  
❌ Not testing edge cases  

## Bonus Challenges (Optional)

- Add caching with `@Cacheable`
- Implement request/response logging
- Add metrics/monitoring
- Implement CSV export endpoint
- Add rate limiting
- Implement GraphQL alternative

## Resources

- [Micronaut Documentation](https://docs.micronaut.io/latest/guide/)
- [Micronaut Data JDBC](https://micronaut-projects.github.io/micronaut-data/latest/guide/)
- [OpenAPI/Swagger](https://micronaut-projects.github.io/micronaut-openapi/latest/guide/)

---

**Good luck!** Remember: Working code > Perfect code. Focus on functionality first, then refine.
