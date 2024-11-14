const elements = {
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
    cancelDownloadButton: document.getElementById('cancelDownload')
};

function updateStatusText(text, opacity = 1) {
    elements.statusText.textContent = text;
    elements.statusText.style.opacity = opacity;
}

function updateDateTime() {
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

function updateTimerDisplay() {
    if (!state.sessionStartTime) return;
    
    const elapsed = Date.now() - state.sessionStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    elements.timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showDownloadModal() {
    elements.downloadModal.style.display = 'block';
}

function hideDownloadModal() {
    elements.downloadModal.style.display = 'none';
}

function handleConfirmDownload() {
    saveConversation();
    hideDownloadModal();
}

function handleCancelDownload() {
    hideDownloadModal();
}