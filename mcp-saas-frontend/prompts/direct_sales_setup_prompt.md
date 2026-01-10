# Direct Sales CRM Setup Guide

Help the user set up their network marketing CRM in Teable. Create these 4 tables:

## Tables to Create

### 1. Contacts
Fields:
- Phone Number (Text) - Primary field
- Full Name (Text)
- Email (Text)
- Type (Single Select): Prospect, Customer, Team Member, Leader
- Status (Single Select): Cold, Warm, Hot, Active, Inactive
- Source (Text)
- Interest (Single Select): Products Only, Business Opportunity, Both
- Sponsor Phone (Text)
- Join Date (Date)
- Rank (Text)
- Birthday (Date)
- Notes (Long Text)

### 2. Orders
Fields:
- Order ID (Text) - Primary field
- Client Phone (Text)
- Date (Date)
- Products (Long Text)
- Amount (Number)
- PV (Number)
- Type (Single Select): First Order, Reorder, Autoship
- Status (Single Select): Pending, Paid, Shipped, Delivered
- Notes (Long Text)

### 3. Team Performance
Fields:
- Member Phone (Text) - Primary field
- Month (Text)
- Personal Sales (Number)
- Personal PV (Number)
- Team Sales (Number)
- Team PV (Number)
- Active Downline (Number)
- New Recruits (Number)
- Notes (Long Text)

### 4. Reminders
Fields:
- Title (Text) - Primary field
- Client Phone (Text)
- Type (Single Select): Follow-up, Reorder, Training, Recognition, Team Meeting
- Due Date (Date)
- Status (Single Select): Pending, Completed, Overdue
- Priority (Single Select): High, Medium, Low
- Notes (Long Text)

## Setup Steps
1. List available bases using list_bases
2. Create each table using create_table
3. Confirm all tables created successfully
4. Share the table IDs with the user for their assistant prompt configuration
