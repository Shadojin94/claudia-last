function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    
    if (!SpeechRecognition) {
        // Fallback pour les navigateurs non supportés
        updateStatusText("Reconnaissance vocale non supportée - utilisation du mode texte");
        setupTextFallback();
        return null;
    }

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
        if (event.error === 'no-speech') {
            handleNoSpeech();
        } else {
            console.error('Erreur de reconnaissance vocale:', event.error);
            updateStatusText("Erreur de reconnaissance vocale");
            stopListening();
            setupTextFallback(); // Active le mode texte en cas d'erreur
        }
    };

    return recognition;
}

function setupTextFallback() {
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.placeholder = 'Tapez votre message ici...';
    textInput.className = 'text-fallback-input';
    
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Envoyer';
    sendButton.className = 'text-fallback-button';
    
    const container = document.createElement('div');
    container.className = 'text-fallback-container';
    container.appendChild(textInput);
    container.appendChild(sendButton);
    
    elements.listenCircle.appendChild(container);
    
    sendButton.addEventListener('click', () => {
        if (textInput.value.trim()) {
            sendToAI(textInput.value);
            textInput.value = '';
        }
    });
    
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && textInput.value.trim()) {
            sendToAI(textInput.value);
            textInput.value = '';
        }
    });
}

async function speakResponseWithOpenAITTS(text) {
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
        
        // Utilisation de l'API Web Audio pour une meilleure compatibilité
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createBufferSource();
        
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        state.isAISpeaking = true;
        startSpectreAnimation();
        
        source.onended = () => {
            stopAISpeaking();
            audioContext.close();
        };

        if (!state.isPaused) {
            source.start(0);
        }
    } catch (error) {
        console.error('Erreur de synthèse vocale:', error);
        // Fallback vers la synthèse vocale native
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.onend = () => stopAISpeaking();
        window.speechSynthesis.speak(utterance);
    }
}