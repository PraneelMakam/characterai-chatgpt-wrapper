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
  Database
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
  const [voiceProvider, setVoiceProvider] = useState('playht'); // 'playht' or 'openai'
  const [analytics, setAnalytics] = useState(null);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  // Generate session ID on component mount
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Fetch characters on component mount
  useEffect(() => {
    fetchCharacters();
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
      const endpoint = voiceProvider === 'playht' 
        ? '/api/text-to-speech/playht' 
        : '/api/text-to-speech/openai';

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
      // Fallback to OpenAI if PlayHT fails
      if (voiceProvider === 'playht') {
        setVoiceProvider('openai');
        playTextToSpeech(text, characterId);
      }
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleVoiceProvider = () => {
    setVoiceProvider(voiceProvider === 'playht' ? 'openai' : 'playht');
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
              onClick={toggleVoiceProvider}
              title={`Switch to ${voiceProvider === 'playht' ? 'OpenAI' : 'PlayHT'} voice`}
            >
              {voiceProvider === 'playht' ? <Zap size={20} /> : <Database size={20} />}
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
                <p>Voice Provider: <strong>{voiceProvider === 'playht' ? 'PlayHT (Realistic)' : 'OpenAI (Standard)'}</strong></p>
                <button className="btn btn-secondary" onClick={toggleVoiceProvider}>
                  Switch to {voiceProvider === 'playht' ? 'OpenAI' : 'PlayHT'}
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
                      <small>Voice: {voiceProvider === 'playht' ? 'PlayHT' : character.openaiVoice}</small>
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
                  <small>Voice: {voiceProvider === 'playht' ? 'PlayHT' : characters[selectedCharacter]?.openaiVoice}</small>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {messages.length === 0 && (
                  <div className="welcome-message">
                    <h3>Welcome to {characters[selectedCharacter]?.name}!</h3>
                    <p>Start a conversation with your chosen character. You can type or use voice input.</p>
                    <p><small>Voice Provider: {voiceProvider === 'playht' ? 'PlayHT (Realistic)' : 'OpenAI (Standard)'}</small></p>
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