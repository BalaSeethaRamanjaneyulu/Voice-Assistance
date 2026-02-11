"""
Whisper Speech Recognition Service
Integrates OpenAI Whisper for speech-to-text functionality
"""

import whisper
import os
import tempfile
from pathlib import Path

class WhisperService:
    """
    Service class for OpenAI Whisper speech recognition
    """
    
    def __init__(self, model_name="base"):
        """
        Initialize Whisper model
        
        Args:
            model_name (str): Model size - tiny, base, small, medium, large
                            Larger models are more accurate but slower
        """
        print(f"Loading Whisper model: {model_name}")
        self.model = whisper.load_model(model_name)
        self.model_name = model_name
        print(f"Whisper model {model_name} loaded successfully")
    
    def transcribe_file(self, audio_path, language=None, task="transcribe"):
        """
        Transcribe audio file to text
        
        Args:
            audio_path (str): Path to audio file
            language (str, optional): Language code (e.g., 'en', 'es')
            task (str): 'transcribe' or 'translate' (translate to English)
        
        Returns:
            dict: Transcription result with text, segments, and metadata
        """
        try:
            result = self.model.transcribe(
                audio_path,
                language=language,
                task=task,
                fp16=False  # Use fp32 for better compatibility
            )
            
            return {
                "success": True,
                "text": result["text"],
                "language": result.get("language"),
                "segments": result.get("segments", []),
                "model": self.model_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": self.model_name
            }
    
    def transcribe_bytes(self, audio_bytes, filename="temp_audio.wav", language=None):
        """
        Transcribe audio from bytes
        
        Args:
            audio_bytes (bytes): Audio file bytes
            filename (str): Temporary filename to use
            language (str, optional): Language code
        
        Returns:
            dict: Transcription result
        """
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(suffix=Path(filename).suffix, delete=False) as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            # Transcribe
            result = self.transcribe_file(temp_path, language=language)
            
            # Cleanup
            os.remove(temp_path)
            
            return result
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": self.model_name
            }
    
    def detect_language(self, audio_path):
        """
        Detect the spoken language in an audio file
        
        Args:
            audio_path (str): Path to audio file
        
        Returns:
            dict: Language detection result
        """
        try:
            # Load audio and pad/trim it to fit 30 seconds
            audio = whisper.load_audio(audio_path)
            audio = whisper.pad_or_trim(audio)

            # Make log-Mel spectrogram and move to the same device as the model
            mel = whisper.log_mel_spectrogram(audio).to(self.model.device)

            # Detect the spoken language
            _, probs = self.model.detect_language(mel)
            detected_language = max(probs, key=probs.get)
            
            return {
                "success": True,
                "language": detected_language,
                "confidence": probs[detected_language],
                "all_probabilities": dict(sorted(probs.items(), key=lambda x: x[1], reverse=True)[:5])
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Available Whisper models and their characteristics
MODELS_INFO = {
    "tiny": {
        "parameters": "39M",
        "required_vram": "~1GB",
        "relative_speed": "~32x",
        "use_case": "Fast, less accurate"
    },
    "base": {
        "parameters": "74M",
        "required_vram": "~1GB",
        "relative_speed": "~16x",
        "use_case": "Balanced speed and accuracy"
    },
    "small": {
        "parameters": "244M",
        "required_vram": "~2GB",
        "relative_speed": "~6x",
        "use_case": "Good accuracy"
    },
    "medium": {
        "parameters": "769M",
        "required_vram": "~5GB",
        "relative_speed": "~2x",
        "use_case": "High accuracy"
    },
    "large": {
        "parameters": "1550M",
        "required_vram": "~10GB",
        "relative_speed": "~1x",
        "use_case": "Best accuracy, slowest"
    }
}


if __name__ == "__main__":
    # Test the service
    print("Whisper Service Test")
    print("=" * 50)
    
    # Initialize with base model
    service = WhisperService(model_name="base")
    
    print("\nWhisper service initialized successfully!")
    print(f"Model: {service.model_name}")
    print("\nAvailable models:")
    for model, info in MODELS_INFO.items():
        print(f"  {model}: {info['parameters']} parameters - {info['use_case']}")
