# Admin WhatsApp System Environment Variables

This document outlines the environment variables needed for the new admin-controlled WhatsApp system.

## Required Environment Variables

### WhatsApp Configuration

```bash
# Enable/disable the admin WhatsApp service
WHATSAPP_ENABLED=true

# Directory for storing admin WhatsApp session data
# Default: ./whatsapp-admin-session
WHATSAPP_ADMIN_SESSION_DIR=./whatsapp-admin-session

# Cron schedule for processing admin reminders (cron format)
# Default: */2 * * * * (every 2 minutes)
ADMIN_REMINDER_CRON_SCHEDULE="*/2 * * * *"
```

### Database Configuration (Required for all systems)

```bash
# Supabase configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Alternative: PostgreSQL direct connection
# TEABLE_DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### Existing Required Variables

```bash
# Encryption key for storing sensitive data
ENCRYPTION_KEY=your_32_character_encryption_key

# Admin dashboard access
ADMIN_PASSWORD=your_secure_admin_password

# Email service (for notifications)
RESEND_API_KEY=your_resend_api_key

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Base URLs
FRONTEND_URL=https://www.resultmarketing.asia
TEABLE_DATABASE_URL=postgresql://connection_string
```

## Migration Required

Before enabling the new admin WhatsApp system, you must run the database migration:

1. Run the migration file: `migrations/003_admin_whatsapp_system.sql`
2. This creates the new admin WhatsApp tables and adds necessary fields to existing tables

## Key Changes from Old System

### Old System (Deprecated)
- Per-customer WhatsApp sessions (`/api/whatsapp/:mcpKey/*`)
- Each customer had their own WhatsApp connection
- Individual QR codes for each customer

### New Admin System
- Single admin WhatsApp session (`/api/admin/whatsapp/*`)
- Admin controls one WhatsApp account
- Admin sends messages to customers via API
- Centralized message logging and queue management

## API Endpoint Changes

### New Admin Endpoints
- `POST /api/admin/whatsapp/connect` - Start admin WhatsApp session
- `GET /api/admin/whatsapp/status` - Get admin connection status
- `POST /api/admin/whatsapp/send-message` - Send message to customer
- `POST /api/admin/whatsapp/queue-reminder` - Queue reminder for customer
- `GET /api/admin/whatsapp/customers` - Get customers with WhatsApp enabled

### New Customer Endpoints
- `POST /api/customers/:mcpKey/whatsapp-phone` - Set customer's WhatsApp number
- `POST /api/customers/:mcpKey/reminders/enable` - Enable reminders for customer
- `GET /api/customers/:mcpKey/whatsapp/status` - Check if admin connected

### Deprecated Endpoints (will be removed)
- `/api/whatsapp/:mcpKey/connect` - ❌ No longer used
- `/api/whatsapp/:mcpKey/disconnect` - ❌ No longer used
- `/api/whatsapp/:mcpKey/test` - ❌ Replaced by admin test

## Security Considerations

1. **Admin Access**: Only authenticated admin users can control WhatsApp
2. **Message Logging**: All messages sent via admin are logged in database
3. **Phone Validation**: Customer phone numbers must be set before enabling reminders
4. **Rate Limiting**: 2-second delays between reminder messages to avoid WhatsApp limits

## Setup Instructions

1. Set the required environment variables
2. Run the database migration
3. Start the server with `WHATSAPP_ENABLED=true`
4. Admin logs into dashboard and connects WhatsApp via QR code
5. Customers set their WhatsApp phone numbers via dashboard
6. Admin can now send messages and manage reminders

## Monitoring

- Check `/api/admin/whatsapp/status` for connection status
- Check `/api/admin/whatsapp/reminders/status` for reminder processing status
- View message logs via `/api/admin/whatsapp/messages`
- Manually trigger reminder processing via `/api/admin/whatsapp/reminders/trigger`