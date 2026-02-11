# API Documentation

## Base URL

```
Development: http://localhost:3001/api
Production: TBD
```

## Authentication

Currently, the API does not require authentication. Future versions will implement JWT-based authentication.

## Health Check

### GET /health

Health check endpoint to verify server status.

**Response**
```json
{
  "status": "OK",
  "timestamp": "2024-02-11T16:00:00.000Z",
  "environment": "development"
}
```

**Status Codes**
- `200 OK` - Server is running

---

## Audio Processing (Future Implementation)

### POST /api/process-audio

Process audio data for analysis or command processing.

**Request Body**
```json
{
  "audioData": "base64_encoded_audio_data",
  "format": "wav",
  "sampleRate": 44100
}
```

**Response**
```json
{
  "id": "analysis_id_123",
  "timestamp": "2024-02-11T16:00:00.000Z",
  "analysis": {
    "frequency": {
      "low": 0.5,
      "mid": 0.3,
      "high": 0.2
    },
    "speechDetected": true,
    "command": "start_recording"
  }
}
```

**Status Codes**
- `200 OK` - Audio processed successfully
- `400 Bad Request` - Invalid audio data
- `413 Payload Too Large` - Audio file too large
- `500 Internal Server Error` - Processing error

---

### GET /api/analysis/:id

Retrieve previously processed audio analysis by ID.

**Parameters**
- `id` (string, required) - Analysis ID

**Response**
```json
{
  "id": "analysis_id_123",
  "timestamp": "2024-02-11T16:00:00.000Z",
  "audioData": "...",
  "analysis": {
    "frequency": {...},
   "speechDetected": true,
    "command": "start_recording"
  }
}
```

**Status Codes**
- `200 OK` - Analysis retrieved successfully
- `404 Not Found` - Analysis ID not found
- `500 Internal Server Error` - Retrieval error

---

## Error Responses

All API errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed description",
  "timestamp": "2024-02-11T16:00:00.000Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 413 | Payload Too Large - Request too large |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server overloaded |

---

## Rate Limiting (Future)

API calls will be rate-limited to prevent abuse:

- **Development**: 1000 requests/hour
- **Production**: 100 requests/minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1612345678
```

---

## WebSocket API (Future)

Real-time audio streaming endpoint.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001/ws/audio');
```

### Events

**Client → Server**

```json
{
  "type": "audio_stream",
  "data": "base64_chunk",
  "timestamp": 1612345678
}
```

**Server → Client**

```json
{
  "type": "analysis_update",
  "data": {
    "frequency": {...},
    "command": "..."
  },
  "timestamp": 1612345678
}
```

---

## Integration Examples

### JavaScript (Fetch API)

```javascript
// Health check
const checkHealth = async () => {
  const response = await fetch('http://localhost:3001/api/health');
  const data = await response.json();
  console.log(data);
};

// Process audio (future)
const processAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  const response = await fetch('http://localhost:3001/api/process-audio', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  return result;
};
```

### cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Process audio (future)
curl -X POST http://localhost:3001/api/process-audio \
  -H "Content-Type: application/json" \
  -d '{"audioData":"...", "format":"wav"}'
```

---

## Future Endpoints

The following endpoints are planned for future releases:

- `POST /api/voice-commands` - Custom voice command registration
- `GET /api/voice-commands` - List registered commands
- `DELETE /api/voice-commands/:id` - Remove voice command
- `POST /api/text-to-speech` - Convert text to speech
- `GET /api/history` - Get processing history
- `POST /api/feedback` - Submit user feedback

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Health check endpoint
- Basic server setup

### v2.0.0 (Planned)
- Audio processing endpoints
- WebSocket support
- Authentication
- Rate limiting
