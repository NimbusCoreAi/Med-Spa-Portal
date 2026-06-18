# Connect API — Developer Integration Guide

## Quick Start

1. Get your API key from your clinic dashboard (Settings → API)
2. Make your first call:

```bash
curl -X POST https://connect-api-xxx.up.railway.app/api/v1/reporting/treatment-metrics \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"clinic_id":"your-clinic-uuid","group_by":"service_type"}'
```

## Authentication

All endpoints (except `/api/health`) require the `X-API-Key` header:

```
X-API-Key: your-api-key-here
```

Requests without a valid key receive `401 Unauthorized`.

## Rate Limits

100 requests per minute per API key. Responses include:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests per window |
| `X-RateLimit-Remaining` | Remaining requests in current window |

When exceeded: `429 Too Many Requests`.

## Endpoints

### POST /api/v1/communications/sms-reminder

Send an SMS appointment reminder.

```bash
curl -X POST .../api/v1/communications/sms-reminder \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_phone": "+15125551234",
    "patient_name": "Jane Doe",
    "appointment_time": "2025-06-20T14:00:00Z",
    "clinic_name": "Glow Spa",
    "template": "pre-appointment"
  }'
```

### POST /api/v1/billing/package-deduct

Deduct a session from a patient's credit package.

```bash
curl -X POST .../api/v1/billing/package-deduct \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": "uuid",
    "patient_id": "uuid",
    "clinic_id": "uuid"
  }'
```

### POST /api/v1/reporting/treatment-metrics

Get revenue and appointment metrics.

```bash
curl -X POST .../api/v1/reporting/treatment-metrics \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_id": "uuid",
    "group_by": "service_type",
    "from": "2025-01-01T00:00:00Z",
    "to": "2025-06-15T23:59:59Z"
  }'
```

## Error Handling

| Status | Meaning |
|--------|---------|
| 400 | Invalid request body |
| 401 | Missing or invalid API key |
| 404 | Resource not found |
| 409 | Conflict (e.g., no sessions remaining) |
| 429 | Rate limit exceeded |
| 500 | Server error |

## SDK Examples

### JavaScript

```javascript
const response = await fetch('https://connect-api-xxx.up.railway.app/api/v1/communications/sms-reminder', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.CONNECT_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    patient_phone: '+15125551234',
    patient_name: 'Jane Doe',
    appointment_time: '2025-06-20T14:00:00Z',
    clinic_name: 'Glow Spa',
  }),
});
const data = await response.json();
```

### Python

```python
import requests

response = requests.post(
    'https://connect-api-xxx.up.railway.app/api/v1/communications/sms-reminder',
    headers={
        'x-api-key': os.environ['CONNECT_API_KEY'],
        'Content-Type': 'application/json',
    },
    json={
        'patient_phone': '+15125551234',
        'patient_name': 'Jane Doe',
        'appointment_time': '2025-06-20T14:00:00Z',
        'clinic_name': 'Glow Spa',
    },
)
data = response.json()
```
