# Task Selection Template

## Developer Information
- **Name**: Isudip Subedi
- **Date**: 2025-11-23
- **Estimated Completion Time**: 6 hours

## Selected Tasks

### Merchants Management Features

#### Merchant List View (30 points available)
- [x] Display merchant information in table format (10 pts)
- [x] Search and filter by name, ID, or status (5 pts)
- [x] Sort by various criteria (5 pts)
- [x] Pagination for large datasets (5 pts)
- [x] Loading states and error handling (5 pts)


#### Add New Merchant (25 points available)
- [x] Form with merchant details (name, email, phone) (8 pts)
- [x] Business information and registration (5 pts)
- [x] Submit to POST `/api/v1/merchants` (5 pts)
- [x] Input validation and error handling (4 pts)
- [x] Success notifications and form reset (3 pts)

#### Edit Merchant Details (20 points available)
- [x] Pre-populate form with existing data (5 pts)
- [x] Update contact details and address (5 pts)
- [x] Manage merchant status (active/inactive) (5 pts)
- [x] Submit to PUT `/api/v1/merchants/:id` (3 pts)
- [x] Confirmation dialogs (2 pts)


#### Merchant Details View (25 points available)
- [x] Display complete merchant profile (5 pts)
- [x] Show transaction statistics (8 pts)
- [x] List recent transactions (7 pts)
- [x] View merchant activity timeline (3 pts)
- [x] Export transaction history (2 pts)

### Transaction Dashboard
- [x] LIST in tabular form 
- [x] Information Cards


## Implementation Plan

### Approach
I focused primarily on merchant management workflows implemented as modal-driven UI components. Work included full create/edit/delete flows for merchants, robust client-side validation, and integration with the backend API. In parallel I implemented a landing page for the transaction list that serves as the entry point for transaction-related features.

### Order of Implementation
1. Build the Merchant List UI and table (data fetching, pagination, filters).
2. Implement the Merchant modal component used for Add / Edit / Delete (form, validation, API calls).
3. Wire up Create (`POST /api/v1/merchants`) and Update (`PUT /api/v1/merchants/:id`) endpoints and success/error handling.
4. Add Recent Transactions section in the Merchant Details modal.
5. Build Transactions landing page (transaction list, basic filtering, and navigation to detailed views).

### Technical Decisions
- Frontend: React + TypeScript (existing codebase uses Vite); reuse project styling and components.
- Data fetching: React Query (or the app's existing data layer) for caching, retries, and background refresh.
- Forms & Validation: react-hook-form + Zod/Yup for schema validation and clear error messages.
- UI: Modal-based flows to keep context while creating/editing merchants; keep pages responsive and accessible.
- Notifications: in-app toast notifications for success/error states.

### Assumptions
- Backend endpoints `POST /api/v1/merchants`, `PUT /api/v1/merchants/:id` and transaction listing endpoints are available and consistent with the frontend DTOs.
- Authentication and authorization are handled at the app level; these flows integrate with the existing auth patterns.
- Server-side pagination and filtering are supported by the API for large datasets.

### Timeline
- [x] Task selection: 2025-11-22
- [x] Start implementation: 2025-11-22
- [x] Target completion: 2025-11-23

---

## Notes

- Work scope: Full CRUD for merchants implemented via modal components; recent transactions surfaced in merchant details; landing page for transactions implemented with basic filters and pagination.
- Testing: unit tests and small integration tests recommended for API flows; manual QA performed for modal UX and error states.
- Accessibility: modals include focus trapping and aria labels. Further a11y review recommended.