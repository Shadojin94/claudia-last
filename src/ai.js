import { state } from './state.js';
import { elements, updateStatusText } from './ui.js';
import { CONFIG } from './config.js';
import { startListening } from './speech.js';
import { speakResponseWithOpenAITTS } from './tts.js';
import { summarizeContext } from './utils.js';

function detectLanguageStyle(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('mec') || lowerText.includes('cool') || lowerText.includes('genre')) {
        return 'casual';
    } else if (lowerText.includes('monsieur') || lowerText.includes('madame') || lowerText.includes('veuillez')) {
        return 'formal';
    }
    return 'neutral';
}

export async function sendToAI(text) {
    updateStatusText("Réflexion en cours...", 0.3);
    elements.aiResponseElement.textContent = "";

    const currentDate = new Date();
    const dateTimeString = currentDate.toLocaleString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const languageStyle = detectLanguageStyle(text);
    const contextSummary = summarizeContext(state.conversationHistory);

    const systemMessage = `${CONFIG.SYSTEM_MESSAGE}\n\nLa date et l'heure actuelles sont : ${dateTimeString}\nStyle de langage détecté : ${languageStyle}. Adaptez votre réponse en conséquence.\n\nRésumé du contexte : ${contextSummary}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.GPT_MODEL,
                messages: [
                    {role: "system", content: systemMessage},
                    ...state.conversationHistory.slice(-10),
                    {role: "user", content: text}
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        
        state.conversationHistory.push({role: "user", content: text});
        state.conversationHistory.push({role: "assistant", content: responseText});
        
        updateStatusText("Claudia répond...");
        elements.aiResponseElement.textContent = responseText;

        const urlMatch = responseText.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            window.open(urlMatch[0], '_blank');
        }

        await speakResponseWithOpenAITTS(responseText);
    } catch (error) {
        console.error('Erreur lors de la communication avec l\'IA:', error);
        updateStatusText(`Erreur: ${error.message}`);
    }
}