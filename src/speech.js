import { state } from './state.js';
import { updateStatusText, elements } from './ui.js';
import { startSpectreAnimation, stopSpectreAnimation } from './animation.js';
import { sendToAI } from './ai.js';
import { CONFIG } from './config.js';

export function initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Reconnaissance vocale non supportée');
        updateStatusText("Veuillez utiliser Safari sur iOS ou Chrome/Edge sur desktop");
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
        updateStatusText("Je vous écoute...");
        if (!state.sessionStartTime) {
            state.sessionStartTime = Date.now();
        }
        startSpectreAnimation();
    };

    recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        if (result.trim()) {
            state.retryCount = 0;
            sendToAI(result);
        } else {
            handleNoSpeech();
        }
    };

    recognition.onend = () => {
        state.isListening = false;
        if (state.isActiveMode && !state.isAISpeaking && !state.isPaused) {
            setTimeout(() => {
                if (state.isActiveMode && !state.isAISpeaking && !state.isPaused) {
                    startListening();
                }
            }, 100);
        } else {
            stopListening();
        }
    };

    recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        stopListening();
        updateStatusText("Erreur de reconnaissance vocale. Réessayez.");
    };

    return recognition;
}

export function startListening() {
    if (state.isAISpeaking || state.isPaused || state.isListening) return;

    if (!state.recognition) {
        state.recognition = initSpeechRecognition();
    }

    try {
        state.isListening = true;
        elements.listenCircle.style.borderColor = '#ff4136';
        state.recognition.start();
    } catch (error) {
        console.error('Erreur lors du démarrage de la reconnaissance vocale:', error);
        stopListening();
        setTimeout(startListening, 100);
    }
}

export function stopListening() {
    if (state.recognition) {
        try {
            state.recognition.stop();
        } catch (error) {
            console.error('Erreur lors de l\'arrêt de la reconnaissance vocale:', error);
        }
    }
    state.isListening = false;
    elements.listenCircle.style.borderColor = '#00c48c';
    stopSpectreAnimation();
    if (!state.isActiveMode && !state.isPaused) {
        updateStatusText("Appuyez ici pour parler");
    }
}

export function stopAISpeaking() {
    elements.audioPlayer.pause();
    elements.audioPlayer.currentTime = 0;
    state.isAISpeaking = false;
    stopSpectreAnimation();
    if (state.isActiveMode && !state.isPaused) {
        setTimeout(startListening, 100);
    } else {
        updateStatusText("Appuyez ici pour parler");
    }
}

function handleNoSpeech() {
    if (state.retryCount < CONFIG.MAX_RETRY_ATTEMPTS) {
        state.retryCount++;
        startListening();
    } else {
        state.retryCount = 0;
        stopListening();
        updateStatusText("Aucune parole détectée");
    }
}