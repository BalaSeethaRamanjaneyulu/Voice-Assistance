# Whisper Quick Start Guide

## 🎯 Quick Commands

### Activate Python Environment
```bash
source backend/venv/bin/activate
```

### Test Whisper
```bash
python3 backend/ai-services/whisper_service.py
```

### Transcribe Audio (Python)
```python
from whisper_service import WhisperService
service = WhisperService("base")
result = service.transcribe_file("audio.wav")
print(result["text"])
```

### Transcribe Audio (Node.js)
```javascript
const WhisperBridge = require('./ai-services/whisperBridge');
const whisper = new WhisperBridge('base');
const result = await whisper.transcribe('audio.wav');
console.log(result.text);
```

## 📂 File Locations

| What | Where |
|------|-------|
| Python Service | `backend/ai-services/whisper_service.py` |
| Node Bridge | `backend/ai-services/whisperBridge.js` |
| Whisper Repo | `backend/ai-services/whisper/` |
| Virtual Env | `backend/venv/` |
| Requirements | `backend/requirements.txt` |
| Documentation | `docs/WHISPER_INTEGRATION.md` |

## 🎚️ Model Selection

| Model | Speed | Accuracy | When to Use |
|-------|-------|----------|-------------|
| tiny | ⚡⚡⚡⚡ | ⭐⭐ | Real-time, low resources |
| **base** | ⚡⚡⚡ | ⭐⭐⭐ | **Default - Best balance** |
| small | ⚡⚡ | ⭐⭐⭐⭐ | Better quality needed |
| medium | ⚡ | ⭐⭐⭐⭐⭐ | High quality |
| large | 🐌 | ⭐⭐⭐⭐⭐ | Best possible quality |

## 🔧 Installation Status

- ✅ Python 3.11.14
- ✅ Virtual environment created
- ✅ Whisper installed (v20250625)
- ✅ PyTorch 2.10.0
- ✅ FFmpeg available
- ✅ Base model tested
- ✅ Service wrappers created

## 🚀 Next Integration Steps

1. Update Express routes to handle audio uploads
2. Connect frontend to send audio data
3. Implement real-time transcription
4. Add voice command parsing
5. Store transcriptions in database

## 📖 Full Documentation

See `/docs/WHISPER_INTEGRATION.md` for complete guide.
