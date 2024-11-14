import { create } from 'zustand';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface AudioState {
  isListening: boolean;
  isAISpeaking: boolean;
  isActiveMode: boolean;
  isAgentMode: boolean;
  aiResponse: string;
  sessionStartTime: number | null;
  currentThread: string | null;
  showDownloadModal: boolean;
  audioQueue: string[];
  recognition: SpeechRecognition | null;

  startListening: () => void;
  stopListening: () => void;
  toggleActiveMode: () => void;
  setAIResponse: (response: string) => void;
  handleImageUpload: (file: File) => Promise<void>;
  startAgentChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  sendMessageToAgent: (message: string) => Promise<void>;
  toggleDownloadModal: () => void;
  addToAudioQueue: (text: string) => void;
  playNextInQueue: () => void;
  initSpeechRecognition: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isListening: false,
  isAISpeaking: false,
  isActiveMode: false,
  isAgentMode: false,
  aiResponse: '',
  sessionStartTime: null,
  currentThread: null,
  showDownloadModal: false,
  audioQueue: [],
  recognition: null,

  initSpeechRecognition: () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      if (!get().sessionStartTime) {
        set({ sessionStartTime: Date.now() });
      }
      set({ isListening: true });
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      if (result.trim()) {
        get().sendMessage(result);
      }
    };

    recognition.onend = () => {
      set({ isListening: false });
      const state = get();
      if (state.isActiveMode && !state.isAISpeaking) {
        setTimeout(() => {
          const currentState = get();
          if (currentState.isActiveMode && !currentState.isAISpeaking) {
            currentState.startListening();
          }
        }, 100);
      }
    };

    recognition.onerror = () => {
      set({ isListening: false });
    };

    set({ recognition });
  },

  startListening: () => {
    const state = get();
    if (state.isAISpeaking || state.isListening) return;

    if (!state.recognition) {
      state.initSpeechRecognition();
    }

    try {
      state.recognition?.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      set({ isListening: false });
      setTimeout(() => get().startListening(), 100);
    }
  },

  stopListening: () => {
    const state = get();
    if (state.recognition) {
      try {
        state.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    set({ isListening: false });
  },

  toggleActiveMode: () => {
    const state = get();
    const newActiveMode = !state.isActiveMode;
    set({ isActiveMode: newActiveMode });
    
    if (newActiveMode && !state.isListening && !state.isAISpeaking) {
      state.startListening();
    } else if (!newActiveMode) {
      state.stopListening();
    }
  },

  setAIResponse: (response: string) => set({ aiResponse: response }),

  handleImageUpload: async (file: File) => {
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Que voyez-vous dans cette image ?" },
              { type: "image_url", image_url: { url: base64 } }
            ]
          }
        ]
      });

      const description = response.choices[0].message.content;
      set({ aiResponse: description });
      get().addToAudioQueue(description);
    } catch (error) {
      console.error('Error processing image:', error);
      set({ aiResponse: "Désolé, une erreur est survenue lors de l'analyse de l'image." });
    }
  },

  startAgentChat: async () => {
    try {
      const response = await openai.beta.threads.create();
      set({ 
        currentThread: response.id,
        isAgentMode: true,
        aiResponse: "Bonjour, je suis votre agent assistant. Comment puis-je vous aider ?"
      });
    } catch (error) {
      console.error('Error starting agent chat:', error);
      set({ aiResponse: "Désolé, impossible de démarrer la conversation avec l'agent." });
    }
  },

  sendMessage: async (message: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }]
      });

      const reply = response.choices[0].message.content;
      set({ aiResponse: reply });
      get().addToAudioQueue(reply);
    } catch (error) {
      console.error('Error sending message:', error);
      set({ aiResponse: "Désolé, une erreur est survenue lors de l'envoi du message." });
    }
  },

  sendMessageToAgent: async (message: string) => {
    const thread = get().currentThread;
    if (!thread) {
      set({ aiResponse: "Erreur: Aucune conversation active avec l'agent." });
      return;
    }

    try {
      await openai.beta.threads.messages.create(thread, {
        role: "user",
        content: message
      });

      const run = await openai.beta.threads.runs.create(thread, {
        assistant_id: "asst_JaH2MRCLxltrsI34qa7gQ5RP"
      });

      let response = await openai.beta.threads.runs.retrieve(thread, run.id);
      while (response.status === "queued" || response.status === "in_progress") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await openai.beta.threads.runs.retrieve(thread, run.id);
      }

      const messages = await openai.beta.threads.messages.list(thread);
      const lastMessage = messages.data[0];
      const reply = lastMessage.content[0].text.value;

      set({ aiResponse: reply });
      get().addToAudioQueue(reply);
    } catch (error) {
      console.error('Error sending message to agent:', error);
      set({ aiResponse: "Désolé, une erreur est survenue lors de la communication avec l'agent." });
    }
  },

  toggleDownloadModal: () => set(state => ({ showDownloadModal: !state.showDownloadModal })),

  addToAudioQueue: (text: string) => {
    set(state => ({ audioQueue: [...state.audioQueue, text] }));
    if (!get().isAISpeaking) {
      get().playNextInQueue();
    }
  },

  playNextInQueue: async () => {
    const state = get();
    if (state.audioQueue.length === 0 || state.isAISpeaking) return;

    const text = state.audioQueue[0];
    set({ isAISpeaking: true });

    try {
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        set(state => ({ 
          isAISpeaking: false,
          audioQueue: state.audioQueue.slice(1)
        }));
        URL.revokeObjectURL(audioUrl);
        get().playNextInQueue();

        // Redémarrer l'écoute si le mode actif est activé
        const currentState = get();
        if (currentState.isActiveMode && !currentState.isListening) {
          setTimeout(() => currentState.startListening(), 100);
        }
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      set(state => ({ 
        isAISpeaking: false,
        audioQueue: state.audioQueue.slice(1)
      }));
      get().playNextInQueue();
    }
  }
}));