function initEventListeners() {
    elements.listenCircle.addEventListener('click', handleListenCircleClick);
    elements.activeListenButton.addEventListener('click', toggleActiveMode);
    elements.pauseButton.addEventListener('click', togglePause);
    elements.uploadButton.addEventListener('click', () => elements.fileUpload.click());
    elements.fileUpload.addEventListener('change', handleFileUpload);
    elements.confirmDownloadButton.addEventListener('click', handleConfirmDownload);
    elements.cancelDownloadButton.addEventListener('click', handleCancelDownload);
}

function handleListenCircleClick() {
    if (state.isAISpeaking) {
        stopAISpeaking();
    } else if (!state.isListening) {
        startListening();
    }
}

function toggleActiveMode() {
    if (state.isPaused) return;
    state.isActiveMode = !state.isActiveMode;
    elements.activeListenButton.classList.toggle('active', state.isActiveMode);
    if (state.isActiveMode && !state.isListening && !state.isAISpeaking) {
        startListening();
    } else if (!state.isActiveMode) {
        stopListening();
    }
}

function togglePause() {
    state.isPaused = !state.isPaused;
    elements.pauseButton.classList.toggle('active', state.isPaused);
    if (state.isPaused) {
        stopListening();
        stopSpectreAnimation();
        elements.audioPlayer.pause();
        updateStatusText("Conversation en pause");
        showDownloadModal();
    } else {
        if (state.isActiveMode) {
            startListening();
        } else {
            updateStatusText("Appuyez ici pour parler");
        }
        if (state.isAISpeaking) {
            elements.audioPlayer.play();
        }
    }
}

function startListening() {
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

function stopListening() {
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

function stopAISpeaking() {
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

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = JSON.parse(e.target.result);
                if (content.history && Array.isArray(content.history)) {
                    state.conversationHistory = content.history;
                    updateStatusText("Contexte chargé avec succès");
                    const summary = summarizeContext(state.conversationHistory);
                    sendToAI(`Contexte chargé : ${summary}. Continue naturellement.`);
                } else {
                    throw new Error("Format de fichier invalide");
                }
            } catch (error) {
                console.error('Erreur:', error);
                updateStatusText("Erreur de chargement du fichier");
            }
        };
        reader.readAsText(file);
    }
}

function saveConversation() {
    const conversationData = {
        timestamp: new Date().toISOString(),
        history: state.conversationHistory
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `conversation_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function summarizeContext(history) {
    if (!history.length) return "Aucun contexte disponible";
    
    const lastMessages = history.slice(-5);
    return lastMessages
        .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Claudia'}: ${msg.content.substring(0, 50)}...`)
        .join(' | ');
}

// Initialisation
function init() {
    initEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 60000);
    setInterval(updateTimerDisplay, 1000);

    if (!('webkitSpeechRecognition' in window)) {
        updateStatusText("Veuillez utiliser Chrome ou Edge pour la reconnaissance vocale");
    }
}

// Lancement de l'initialisation
window.addEventListener('load', init);
window.addEventListener('resize', () => {
    if (elements.canvas) {
        elements.canvas.width = elements.canvas.offsetWidth;
        elements.canvas.height = elements.canvas.offsetHeight;
    }
});