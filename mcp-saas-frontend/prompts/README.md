# CRM AI Assistant Prompts

## Overview

Each industry has 2 prompts:
1. **Setup Prompt** - For initial CRM creation (one-time use)
2. **Assistant Prompt** - For daily use (ongoing)

## Prompt Files

| Industry | Setup Prompt | Assistant Prompt |
|----------|--------------|------------------|
| Insurance Agent | `insurance_setup_prompt.md` | `insurance_agent_prompt.md` |
| Property Agent | `property_setup_prompt.md` | `property_agent_prompt.md` |
| Direct Sales | `direct_sales_setup_prompt.md` | `direct_sales_prompt.md` |

## What Each Industry Can Actually Do

### Insurance Agent
**Core Value:** Never forget a client, policy renewal, or follow-up

| Feature | What It Does |
|---------|--------------|
| Client Memory | Store client details, family info, preferences |
| Policy Tracking | Track all policies, premiums, renewal dates |
| Renewal Alerts | Get notified 30 days before renewals |
| Birthday Reminders | Never miss a client's birthday |
| Follow-up System | Automatic reminders after every interaction |
| Morning Brief | Daily summary of what needs attention |

**Key Workflows:**
- Add lead → Set follow-up → Log interactions → Convert to client → Add policies → Track renewals

---

### Property Agent
**Core Value:** Match the right property to the right buyer, track every viewing

| Feature | What It Does |
|---------|--------------|
| Buyer/Seller Database | Store budget, preferences, requirements |
| Property Listings | Track all listings with details |
| Viewing Scheduler | Schedule and track property viewings |
| Auto-Match | Find properties matching buyer criteria |
| Deal Tracking | Follow deals from viewing to closing |
| Follow-up System | Reminders after viewings |

**Key Workflows:**
- Register buyer with budget → Search matching properties → Schedule viewing → Log feedback → Follow up → Close deal

---

### Direct Sales / Network Marketing
**Core Value:** Track prospects, customers, and team all in one place

| Feature | What It Does |
|---------|--------------|
| Prospect Pipeline | Track prospects from cold to hot |
| Customer Orders | Log orders and track reorders |
| Team Tracking | Monitor downline performance |
| Reorder Reminders | Alert when customers due for reorder |
| Volume Tracking | Track PV/BV for qualification |
| Rank Progress | Monitor advancement criteria |

**Key Workflows:**
- Add prospect → Warm up → Convert to customer/team → Track orders → Follow up for reorders → Build team

---

## Prompt Design Principles

1. **Keep it short** - Under 100 lines for Claude's context limit
2. **Clear table schema** - Only essential fields
3. **Simple commands** - Natural language triggers
4. **Critical rules** - Phone format, key workflows
5. **Action-oriented** - Every command leads to database action

## Phone Number Standard

ALL industries use the same phone format: `60123456789`
- No plus sign, spaces, dashes, or brackets
- Always starts with 60 (Malaysia country code)
- This ensures records link properly across tables

## Usage

### For New Customer Onboarding
1. Customer subscribes via Stripe
2. Use SETUP prompt to create their CRM tables
3. Give customer the ASSISTANT prompt for their Claude project

### For Daily Use
Customer adds the Assistant Prompt to their Claude Desktop project settings, then can:
- Ask for morning briefs
- Add/search contacts
- Log activities
- Get reminders
- Generate reports
