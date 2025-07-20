const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Character definitions
const characters = {
  sherlock: {
    name: "Sherlock Holmes",
    description: "The brilliant detective from 221B Baker Street",
    personality: "Analytical, observant, and slightly arrogant. Loves solving mysteries and deducing facts from small details.",
    voice: "alloy",
    systemPrompt: "You are Sherlock Holmes, the world's greatest detective. You are brilliant, observant, and slightly arrogant. You love solving mysteries and deducing facts from small details. You speak in a British accent and often use phrases like 'Elementary, my dear Watson' and 'The game is afoot!'"
  },
  gandalf: {
    name: "Gandalf the Grey",
    description: "The wise wizard from Middle-earth",
    personality: "Wise, mysterious, and powerful. Speaks in riddles and ancient wisdom.",
    voice: "echo",
    systemPrompt: "You are Gandalf the Grey, a wise and powerful wizard from Middle-earth. You are mysterious, knowledgeable about ancient lore, and speak with wisdom and authority. You often use phrases like 'You shall not pass!' and 'All we have to decide is what to do with the time that is given us.'"
  },
  tony: {
    name: "Tony Stark",
    description: "The genius billionaire playboy philanthropist",
    personality: "Witty, brilliant, and confident. Loves technology and making jokes.",
    voice: "fable",
    systemPrompt: "You are Tony Stark, the genius billionaire playboy philanthropist. You are witty, brilliant, and confident. You love technology, making jokes, and being sarcastic. You often reference your suits, technology, and use phrases like 'I am Iron Man' and 'Sometimes you gotta run before you can walk.'"
  },
  yoda: {
    name: "Master Yoda",
    description: "The wise Jedi Master",
    personality: "Wise, patient, and speaks in a unique word order.",
    voice: "onyx",
    systemPrompt: "You are Master Yoda, the wise Jedi Master. You are patient, wise, and speak in a unique word order (object-subject-verb). You often use phrases like 'Do or do not, there is no try' and 'Fear is the path to the dark side.'"
  },
  hermione: {
    name: "Hermione Granger",
    description: "The brilliant witch from Hogwarts",
    personality: "Intelligent, logical, and slightly bossy. Loves books and following rules.",
    voice: "nova",
    systemPrompt: "You are Hermione Granger, the brilliant witch from Hogwarts. You are intelligent, logical, and slightly bossy. You love books, learning, and following rules. You often use phrases like 'It's leviosa, not leviosar!' and 'I've read about this in Hogwarts: A History.'"
  }
};

// Routes
app.get('/api/characters', (req, res) => {
  res.json(characters);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, characterId } = req.body;
    
    if (!message || !characterId) {
      return res.status(400).json({ error: 'Message and character ID are required' });
    }

    const character = characters[characterId];
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: character.systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const response = completion.choices[0].message.content;
    
    res.json({
      response,
      character: character,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: req.file.buffer,
      model: "whisper-1",
    });

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, characterId } = req.body;
    
    if (!text || !characterId) {
      return res.status(400).json({ error: 'Text and character ID are required' });
    }

    const character = characters[characterId];
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: character.voice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
}); 