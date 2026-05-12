# Event Reminders Setup Guide

## Overview
The Events.life platform sends automated 24-hour event reminders to all confirmed attendees. This guide explains how to set up and use the reminder system.

---

## How It Works

1. **Timing**: Reminders are sent to confirmed attendees when an event is ~24 hours away
2. **Audience**: Only confirmed attendees receive reminders (not pending or waitlisted)
3. **Content**: Email includes event title, date/time, location, and link to view details
4. **Non-destructive**: Reminders are stateless - safe to call multiple times (won't duplicate emails)

---

## Setup Options

### Option 1: External Cron Service (Recommended)

Use a free cron service to call the reminder endpoint every hour:

#### Using EasyCron
1. Go to https://www.easycron.com
2. Create new cron job with these settings:
   - **URL**: `https://gatewise-events.vercel.app/api/reminders`
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_REMINDER_API_TOKEN
     Content-Type: application/json
     ```
   - **Body**: `{}`
   - **Cron Expression**: `0 * * * *` (hourly)
3. Set `REMINDER_API_TOKEN` environment variable in Vercel dashboard

#### Using Make (formerly Integromat)
1. Create new scenario in https://make.com
2. Add HTTP > Make a request module:
   - **URL**: `https://gatewise-events.vercel.app/api/reminders`
   - **Method**: POST
   - **Headers**:
     ```
     Authorization: Bearer YOUR_REMINDER_API_TOKEN
     Content-Type: application/json
     ```
   - **Body**: `{}`
3. Schedule to run hourly
4. Set `REMINDER_API_TOKEN` in Vercel environment variables

#### Using n8n (Self-hosted)
1. Create new workflow
2. Add Cron node: `0 * * * *` (hourly)
3. Add HTTP Request node:
   - **URL**: `https://gatewise-events.vercel.app/api/reminders`
   - **Method**: POST
   - **Headers**:
     ```
     Authorization: Bearer YOUR_REMINDER_API_TOKEN
     Content-Type: application/json
     ```
4. Deploy workflow

### Option 2: Manual Trigger via API

Call the endpoint manually using curl or any HTTP client:

```bash
curl -X POST https://gatewise-events.vercel.app/api/reminders \
  -H "Authorization: Bearer YOUR_REMINDER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or from JavaScript:
```javascript
const response = await fetch('https://gatewise-events.vercel.app/api/reminders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_REMINDER_API_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({}),
});
const result = await response.json();
console.log(result);
```

### Option 3: Future - Vercel Cron (Coming Soon)

Once Vercel Cron is fully released, we can use native Vercel scheduling:

```typescript
// Will be supported in /app/api/reminders/route.ts with:
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Vercel will automatically call this hourly
}
```

---

## Environment Variables

Set in Vercel dashboard:

```
REMINDER_API_TOKEN = "your-secret-token-here"
```

Generate a secure token:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## API Reference

### POST /api/reminders

**Send event reminders**

**Headers:**
```
Authorization: Bearer YOUR_REMINDER_API_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "eventId": "optional-event-id-to-send-reminders-for-specific-event"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sent X reminders for Y event(s)",
  "eventsFound": 1,
  "reminders": 45,
  "results": [
    {
      "eventTitle": "Tech Meetup 2026",
      "attendees": 45,
      "sent": 45,
      "failed": 0
    }
  ]
}
```

### GET /api/reminders

**Preview upcoming reminders**

**Response:**
```json
{
  "now": "2026-05-18T14:30:00Z",
  "window": "2026-05-19T13:30:00Z to 2026-05-19T14:30:00Z",
  "eventsNeedingReminders": 2,
  "events": [
    {
      "id": "evt_123",
      "title": "Tech Meetup 2026",
      "date": "2026-05-19T18:00:00Z",
      "confirmedAttendees": 45
    }
  ]
}
```

---

## Testing

### Preview upcoming reminders
```bash
curl https://gatewise-events.vercel.app/api/reminders
```

### Send reminders for specific event
```bash
curl -X POST https://gatewise-events.vercel.app/api/reminders \
  -H "Authorization: Bearer YOUR_REMINDER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "evt_123"}'
```

### Frequency recommendation

- **Hourly**: Sends reminders when events are 23-24 hours away
- **Twice daily**: More frequently check for upcoming events
- **Once daily**: Risk missing some reminders (not recommended)

---

## Monitoring

Check logs in:
1. **Vercel Dashboard**: Deployments → Function Logs
2. **Application Logs**: Search for `[reminder]` prefix

### Sample log output
```
[reminder] Sent 45 reminders for "Tech Meetup 2026"
[reminder] failed for user@example.com: invalid email
```

---

## Email Template

Reminder emails include:
- Event title
- Date and time
- Location (if available)
- Call-to-action button to view event details
- Note about the email

Template is styled consistently with other platform emails (dark luxury theme).

---

## Future Enhancements

- [ ] Configurable reminder timing (12h, 24h, 1h before)
- [ ] Per-organizer reminder preferences
- [ ] SMS reminders (Twilio integration)
- [ ] In-app notifications
- [ ] Post-event follow-up emails
- [ ] Reminder status tracking in database

