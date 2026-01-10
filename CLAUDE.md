# Claude AI Assistant Instructions

## CRITICAL: Git Configuration
- **ALWAYS** use email: ngsanzen@gmail.com
- **ALWAYS** use name: ngsanzen
- **BEFORE EVERY COMMIT** run: `git config user.email "ngsanzen@gmail.com" && git config user.name "ngsanzen"`
- This is MANDATORY for all commits in this project

## Project Architecture

### WhatsApp Integration
- **Single Admin WhatsApp Session**: Uses Bailey library for one admin WhatsApp account that sends messages TO customers
- **Admin Session Manager**: `teable-mcp-server/src/whatsapp/adminSessionManager.ts`
- **API Endpoints**: Clean endpoints in main.ts without `-new` suffix
  - `/api/admin/whatsapp/connect` - Connect admin WhatsApp
  - `/api/admin/whatsapp/status` - Get connection status
  - `/api/admin/whatsapp/disconnect` - Disconnect admin WhatsApp
  - `/api/admin/whatsapp/qr` - Get QR code for connection
  - `/api/admin/whatsapp/test` - Send test message
  - `/api/admin/whatsapp/send` - Send message to customer

### Railway Deployment
- **Environment Variable Required**: WHATSAPP_ENABLED=true in teable-mcp-server-production service
- **Auto-deployment**: Pushes to GitHub trigger Railway deployments

### GitHub Repositories
- Frontend: https://github.com/Jacobngai/mcp-saas-frontend
- Backend: https://github.com/Jacobngai/teable-mcp-server

## Commands to Run After Changes
- `npm run build` (if applicable)
- `npm run lint` (if applicable)
- `npm run typecheck` (if applicable)

## Important Notes
- Always use git config user.email "ngsanzen@gmail.com" before pushing
- WhatsApp session uses single admin account to avoid IP ban issues with Railway shared IPs
- All customer data is encrypted in Supabase PostgreSQL