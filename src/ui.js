import { state } from './state.js';

export const elements = {
    canvas: document.getElementById('spectre'),
    listenCircle: document.getElementById('listenCircle'),
    statusText: document.getElementById('statusText'),
    aiResponseElement: document.getElementById('aiResponse'),
    timerElement: document.getElementById('timer'),
    audioPlayer: document.getElementById('audioPlayer'),
    pauseButton: document.getElementById('pauseButton'),
    activeListenButton: document.getElementById('activeListenButton'),
    uploadButton: document.getElementById('uploadButton'),
    fileUpload: document.getElementById('fileUpload'),
    datetimeElement: document.getElementById('datetime'),
    downloadModal: document.getElementById('downloadModal'),
    confirmDownloadButton: document.getElementById('confirmDownload'),
    cancelDownloadButton: document.getElementById('cancelDownload'),
    saveButton: document.getElementById('saveButton'),
    imageUploadModal: document.getElementById('imageUploadModal'),
    imageInput: document.getElementById('imageInput'),
    camera: document.getElementById('camera'),
    takePictureButton: document.getElementById('takePicture'),
    closeImageModalButton: document.getElementById('closeImageModal')
};

export function updateStatusText(text, opacity = 1) {
    elements.statusText.textContent = text;
    elements.statusText.style.opacity = opacity;
}

export function updateDateTime() {
    const now = new Date();
    elements.datetimeElement.textContent = now.toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function updateTimerDisplay() {
    if (!state.sessionStartTime) return;
    
    const elapsed = Date.now() - state.sessionStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    elements.timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function showDownloadModal() {
    elements.downloadModal.style.display = 'block';
}

export function hideDownloadModal() {
    elements.downloadModal.style.display = 'none';
}