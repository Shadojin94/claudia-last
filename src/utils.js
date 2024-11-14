import { state } from './state.js';
import { updateStatusText, elements } from './ui.js';
import { sendToAI } from './ai.js';
import { CONFIG } from './config.js';

export async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        updateStatusText("Veuillez sélectionner une image valide");
        return;
    }

    try {
        updateStatusText("Analyse de l'image en cours...");
        const base64Image = await convertImageToBase64(file);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.VISION_MODEL,
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: "Décris cette image en détail en français. Sois naturel et précis." 
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const description = data.choices[0].message.content;
        
        elements.imageUploadModal.style.display = 'none';
        sendToAI(`Voici ce que je vois dans l'image : ${description}`);
    } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        updateStatusText("Erreur lors de l'analyse de l'image. Réessayez.");
    }
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Redimensionner l'image si nécessaire
                let width = img.width;
                let height = img.height;
                const maxSize = 2048;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir en base64 avec compression JPEG
                const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                resolve(base64);
            };
            img.onerror = () => reject(new Error("Erreur lors du chargement de l'image"));
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function handleFileUpload(event) {
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

export function saveConversation() {
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

export function summarizeContext(history) {
    if (!history.length) return "Aucun contexte disponible";
    
    const lastMessages = history.slice(-5);
    return lastMessages
        .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Claudia'}: ${msg.content.substring(0, 50)}...`)
        .join(' | ');
}