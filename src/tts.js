import { state } from './state.js';
import { CONFIG } from './config.js';
import { elements } from './ui.js';
import { stopAISpeaking } from './speech.js';
import { startSpectreAnimation } from './animation.js';

export async function speakResponseWithOpenAITTS(text) {
    try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "tts-1",
                input: text,
                voice: "nova"
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Utilisation de l'élément audio standard pour une meilleure compatibilité
        elements.audioPlayer.src = audioUrl;
        elements.audioPlayer.onended = stopAISpeaking;
        
        state.isAISpeaking = true;
        startSpectreAnimation();

        if (!state.isPaused) {
            try {
                await elements.audioPlayer.play();
            } catch (error) {
                console.error('Erreur de lecture audio:', error);
                // Fallback vers la synthèse vocale native
                useFallbackSpeech(text);
            }
        }
    } catch (error) {
        console.error('Erreur de synthèse vocale:', error);
        useFallbackSpeech(text);
    }
}

function useFallbackSpeech(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.onend = stopAISpeaking;
        window.speechSynthesis.speak(utterance);
    } else {
        console.error('Aucune synthèse vocale disponible');
        stopAISpeaking();
    }
}