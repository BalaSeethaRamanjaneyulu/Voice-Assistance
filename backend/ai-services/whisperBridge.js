const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

/**
 * Node.js bridge to Python Whisper service
 * Allows Node.js backend to communicate with Python Whisper
 */
class WhisperBridge {
    constructor(modelName = 'base') {
        this.modelName = modelName;
        this.pythonPath = path.join(__dirname, '../../venv/bin/python3');
        this.servicePath = path.join(__dirname, 'whisper_service.py');
    }

    /**
     * Transcribe audio file to text
     * @param {string} audioPath - Path to audio file
     * @param {string} language - Optional language code (e.g., 'en')
     * @returns {Promise<Object>} Transcription result
     */
    async transcribe(audioPath, language = null) {
        return new Promise((resolve, reject) => {
            const args = [
                this.servicePath,
                'transcribe',
                audioPath,
                this.modelName
            ];

            if (language) {
                args.push('--language', language);
            }

            const python = spawn(this.pythonPath, args);
            let output = '';
            let error = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Whisper transcription failed: ${error}`));
                } else {
                    try {
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (e) {
                        reject(new Error(`Failed to parse Whisper output: ${e.message}`));
                    }
                }
            });
        });
    }

    /**
     * Detect language of audio file
     * @param {string} audioPath - Path to audio file
     * @returns {Promise<Object>} Language detection result
     */
    async detectLanguage(audioPath) {
        return new Promise((resolve, reject) => {
            const args = [
                this.servicePath,
                'detect',
                audioPath,
                this.modelName
            ];

            const python = spawn(this.pythonPath, args);
            let output = '';
            let error = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Language detection failed: ${error}`));
                } else {
                    try {
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (e) {
                        reject(new Error(`Failed to parse output: ${e.message}`));
                    }
                }
            });
        });
    }
}

module.exports = WhisperBridge;
