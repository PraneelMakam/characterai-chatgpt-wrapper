import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  User, 
  Bot,
  Settings,
  MessageCircle,
  Users,
  Zap,
  Database,
  Sparkles
} from 'lucide-react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [characters, setCharacters] = useState({});
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showCharacterSelect, setShowCharacterSelect] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [voiceProvider, setVoiceProvider] = useState('elevenlabs'); // 'elevenlabs', 'playht', or 'openai'
  const [analytics, setAnalytics] = useState(null);
  const [availableProviders, setAvailableProviders] = useState({
    elevenlabs: false,
    playht: false,
    openai: true
  });
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Generate session ID on component mount
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Fetch characters and check available providers on component mount
  useEffect(() => {
    fetchCharacters();
    checkAvailableProviders();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCharacters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/characters`);
      setCharacters(response.data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const checkAvailableProviders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setAvailableProviders(response.data.voice_providers);
      
      // Set default provider based on availability
      if (response.data.voice_providers.elevenlabs) {
        setVoiceProvider('elevenlabs');
      } else if (response.data.voice_providers.playht) {
        setVoiceProvider('playht');
      } else {
        setVoiceProvider('openai');
      }
    } catch (error) {
      console.error('Error checking providers:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCharacterSelect = (characterId) => {
    setSelectedCharacter(characterId);
    setShowCharacterSelect(false);
    setMessages([]);
  };

  const sendMessage = async (message) => {
    if (!message.trim() || !selectedCharacter) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: message,
        characterId: selectedCharacter,
        sessionId: sessionId
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        sender: 'ai',
        character: response.data.character,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);

      // Auto-play voice if enabled
      if (voiceEnabled) {
        playTextToSpeech(response.data.response, selectedCharacter);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        character: characters[selectedCharacter],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await axios.post(`${API_BASE_URL}/api/speech-to-text`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const transcribedText = response.data.text;
      if (transcribedText.trim()) {
        sendMessage(transcribedText);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const playTextToSpeech = async (text, characterId) => {
    try {
      const endpoint = `/api/text-to-speech/${voiceProvider}`;

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        text: text,
        characterId: characterId
      }, {
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      // Try fallback providers
      if (voiceProvider === 'elevenlabs' && availableProviders.playht) {
        setVoiceProvider('playht');
        playTextToSpeech(text, characterId);
      } else if (voiceProvider === 'playht' && availableProviders.elevenlabs) {
        setVoiceProvider('elevenlabs');
        playTextToSpeech(text, characterId);
      } else if (availableProviders.openai) {
        setVoiceProvider('openai');
        playTextToSpeech(text, characterId);
      }
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const cycleVoiceProvider = () => {
    const providers = ['elevenlabs', 'playht', 'openai'];
    const currentIndex = providers.indexOf(voiceProvider);
    const nextIndex = (currentIndex + 1) % providers.length;
    const nextProvider = providers[nextIndex];
    
    // Find next available provider
    let foundProvider = false;
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[(nextIndex + i) % providers.length];
      if (availableProviders[provider]) {
        setVoiceProvider(provider);
        foundProvider = true;
        break;
      }
    }
    
    if (!foundProvider) {
      setVoiceProvider('openai'); // Always fallback to OpenAI
    }
  };

  const getVoiceProviderInfo = () => {
    switch (voiceProvider) {
      case 'elevenlabs':
        return { name: 'ElevenLabs', icon: <Zap size={20} />, description: 'Ultra-Realistic' };
      case 'playht':
        return { name: 'PlayHT', icon: <Sparkles size={20} />, description: 'Character Voices' };
      case 'openai':
        return { name: 'OpenAI', icon: <Database size={20} />, description: 'Standard' };
      default:
        return { name: 'OpenAI', icon: <Database size={20} />, description: 'Standard' };
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowCharacterSelect(true);
    setSelectedCharacter(null);
    setSessionId(crypto.randomUUID());
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const voiceProviderInfo = getVoiceProviderInfo();

  return (
    <div className="app">
      <audio ref={audioRef} />
      
      {/* Header */}
      <header className="header">
        <motion.div 
          className="header-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="title">
            <MessageCircle size={32} />
            CharacterAI ChatGPT Wrapper v2.0
          </h1>
          <div className="header-controls">
            <button 
              className="btn btn-secondary"
              onClick={cycleVoiceProvider}
              title={`Current: ${voiceProviderInfo.name} (${voiceProviderInfo.description}) - Click to cycle`}
            >
              {voiceProviderInfo.icon}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={toggleVoice}
              title={voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
            >
              {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={resetChat}
              title="Reset Chat"
            >
              <Settings size={20} />
            </button>
          </div>
        </motion.div>
      </header>

      <main className="main">
        <AnimatePresence mode="wait">
          {showCharacterSelect ? (
            <motion.div
              key="character-select"
              className="character-select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h2>Choose Your Character</h2>
              <div className="voice-provider-info">
                <p>Voice Provider: <strong>{voiceProviderInfo.name} ({voiceProviderInfo.description})</strong></p>
                <div className="provider-status">
                  <span className={`status ${availableProviders.elevenlabs ? 'available' : 'unavailable'}`}>
                    ElevenLabs: {availableProviders.elevenlabs ? '✅' : '❌'}
                  </span>
                  <span className={`status ${availableProviders.playht ? 'available' : 'unavailable'}`}>
                    PlayHT: {availableProviders.playht ? '✅' : '❌'}
                  </span>
                  <span className={`status ${availableProviders.openai ? 'available' : 'unavailable'}`}>
                    OpenAI: {availableProviders.openai ? '✅' : '❌'}
                  </span>
                </div>
                <button className="btn btn-secondary" onClick={cycleVoiceProvider}>
                  Switch Voice Provider
                </button>
              </div>
              <div className="character-grid">
                {Object.entries(characters).map(([id, character]) => (
                  <motion.div
                    key={id}
                    className="character-card"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCharacterSelect(id)}
                  >
                    <div className="character-avatar">
                      <Users size={48} />
                    </div>
                    <h3>{character.name}</h3>
                    <p>{character.description}</p>
                    <div className="character-personality">
                      <strong>Personality:</strong> {character.personality}
                    </div>
                    <div className="voice-info">
                      <small>Voice: {voiceProviderInfo.name}</small>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-interface"
              className="chat-container"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              {/* Character Info */}
              <div className="character-info">
                <div className="character-avatar">
                  <Users size={32} />
                </div>
                <div>
                  <h3>{characters[selectedCharacter]?.name}</h3>
                  <p>{characters[selectedCharacter]?.description}</p>
                  <small>Voice: {voiceProviderInfo.name} ({voiceProviderInfo.description})</small>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length === 0 && (
                  <div className="welcome-message">
                    <h3>Welcome to {characters[selectedCharacter]?.name}!</h3>
                    <p>Start a conversation with your chosen character. You can type or use voice input.</p>
                    <p><small>Voice Provider: {voiceProviderInfo.name} ({voiceProviderInfo.description})</small></p>
                  </div>
                )}
                
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`message ${message.sender}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="message-avatar">
                        {message.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                      </div>
                      <div className="message-content">
                        <div className="message-text">{message.text}</div>
                        <div className="message-timestamp">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    className="message ai loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="message-avatar">
                      <Bot size={20} />
                    </div>
                    <div className="message-content">
                      <div className="loading-indicator">
                        <div className="spinner"></div>
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form className="input-area" onSubmit={handleSubmit}>
                <div className="input-container">
                  <input
                    type="text"
                    className="input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                  />
                  <div className="input-buttons">
                    <button
                      type="button"
                      className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!inputMessage.trim() || isLoading}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App; 