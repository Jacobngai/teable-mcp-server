# Insurance CRM Setup Guide

Help the user set up their insurance agent CRM in Teable. Create these 4 tables:

## Tables to Create

### 1. Contacts
Fields:
- Phone Number (Text) - Primary field
- Full Name (Text)
- Email (Text)
- Birthday (Date)
- Type (Single Select): Lead, Prospect, Client
- Status (Single Select): Active, Inactive, Lost
- Source (Text)
- Notes (Long Text)

### 2. Policies
Fields:
- Policy Number (Text) - Primary field
- Client Phone (Text)
- Policy Type (Single Select): Life, Medical, Investment, Motor, Property, Other
- Insurance Company (Text)
- Premium Amount (Number)
- Payment Frequency (Single Select): Monthly, Quarterly, Half-Yearly, Yearly
- Renewal Date (Date)
- Status (Single Select): Active, Lapsed, Cancelled, Matured

### 3. Reminders
Fields:
- Title (Text) - Primary field
- Client Phone (Text)
- Type (Single Select): Follow-up, Birthday, Renewal, Payment Due, Meeting
- Due Date (Date)
- Status (Single Select): Pending, Completed, Overdue
- Priority (Single Select): High, Medium, Low
- Notes (Long Text)

### 4. Interactions
Fields:
- Subject (Text) - Primary field
- Client Phone (Text)
- Type (Single Select): Call, Meeting, WhatsApp, Email
- Date (Date)
- Outcome (Single Select): Positive, Neutral, Negative, Follow-up Needed
- Summary (Long Text)
- Next Action (Text)

## Setup Steps
1. List available bases using list_bases
2. Create each table using create_table
3. Confirm all tables created successfully
4. Share the table IDs with the user for their assistant prompt configuration
