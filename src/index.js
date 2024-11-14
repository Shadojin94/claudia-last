import './styles/main.css';
import { state } from './state.js';
import { elements, updateDateTime, updateTimerDisplay } from './ui.js';
import { initSpeechRecognition, startListening, stopListening, stopAISpeaking } from './speech.js';
import { startSpectreAnimation, stopSpectreAnimation } from './animation.js';
import { handleImageUpload, handleFileUpload, saveConversation } from './utils.js';

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
        elements.downloadModal.style.display = 'block';
    } else {
        if (state.isActiveMode) {
            startListening();
        }
        if (state.isAISpeaking) {
            elements.audioPlayer.play();
        }
    }
}

function showImageUploadModal() {
    elements.imageUploadModal.style.display = 'block';
}

function hideImageUploadModal() {
    elements.imageUploadModal.style.display = 'none';
}

// Initialize the application
function init() {
    if (!state.recognition) {
        state.recognition = initSpeechRecognition();
    }

    // Event listeners
    elements.listenCircle.addEventListener('click', handleListenCircleClick);
    elements.activeListenButton.addEventListener('click', toggleActiveMode);
    elements.pauseButton.addEventListener('click', togglePause);
    elements.uploadButton.addEventListener('click', () => elements.fileUpload.click());
    elements.fileUpload.addEventListener('change', handleFileUpload);
    elements.confirmDownloadButton.addEventListener('click', () => {
        saveConversation();
        elements.downloadModal.style.display = 'none';
    });
    elements.cancelDownloadButton.addEventListener('click', () => {
        elements.downloadModal.style.display = 'none';
    });
    elements.saveButton.addEventListener('click', showImageUploadModal);
    elements.imageInput.addEventListener('change', handleImageUpload);
    elements.takePictureButton.addEventListener('click', () => elements.camera.click());
    elements.camera.addEventListener('change', handleImageUpload);
    elements.closeImageModalButton.addEventListener('click', hideImageUploadModal);

    // Start timers
    updateDateTime();
    setInterval(updateDateTime, 60000);
    setInterval(updateTimerDisplay, 1000);

    // Handle window resize
    window.addEventListener('resize', () => {
        if (elements.canvas) {
            elements.canvas.width = elements.canvas.offsetWidth;
            elements.canvas.height = elements.canvas.offsetHeight;
        }
    });
}

// Start the application
window.addEventListener('load', init);