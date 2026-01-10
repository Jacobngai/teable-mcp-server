# Property Agent CRM Setup Guide

Help the user set up their real estate agent CRM in Teable. Create these 4 tables:

## Tables to Create

### 1. Contacts
Fields:
- Phone Number (Text) - Primary field
- Full Name (Text)
- Email (Text)
- Type (Single Select): Buyer, Seller, Tenant, Landlord, Investor
- Status (Single Select): Active, Inactive, Closed
- Budget Min (Number)
- Budget Max (Number)
- Preferred Areas (Text)
- Property Preference (Single Select): Condo, Landed, Commercial, Land
- Birthday (Date)
- Notes (Long Text)

### 2. Properties
Fields:
- Property ID (Text) - Primary field
- Title (Text)
- Type (Single Select): Condo, Terrace, Semi-D, Bungalow, Commercial, Land
- Transaction (Single Select): Sale, Rent
- Price (Number)
- Location (Text)
- Address (Long Text)
- Bedrooms (Number)
- Bathrooms (Number)
- Size (Number)
- Owner Phone (Text)
- Status (Single Select): Available, Reserved, Sold, Rented, Withdrawn
- Notes (Long Text)

### 3. Viewings
Fields:
- Viewing ID (Text) - Primary field
- Property ID (Text)
- Client Phone (Text)
- Date (Date)
- Time (Text)
- Status (Single Select): Scheduled, Completed, Cancelled, No-Show
- Feedback (Single Select): Interested, Maybe, Not Interested
- Notes (Long Text)

### 4. Reminders
Fields:
- Title (Text) - Primary field
- Client Phone (Text)
- Property ID (Text)
- Type (Single Select): Follow-up, Viewing, SPA Signing, Key Handover, Payment
- Due Date (Date)
- Status (Single Select): Pending, Completed, Overdue
- Priority (Single Select): High, Medium, Low
- Notes (Long Text)

## Setup Steps
1. List available bases using list_bases
2. Create each table using create_table
3. Confirm all tables created successfully
4. Share the table IDs with the user for their assistant prompt configuration
