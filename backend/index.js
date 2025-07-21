const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Enhanced character definitions with PlayHT voices
const characters = {
  sherlock: {
    name: "Sherlock Holmes",
    description: "The brilliant detective from 221B Baker Street",
    personality: "Analytical, observant, and slightly arrogant. Loves solving mysteries and deducing facts from small details.",
    openaiVoice: "alloy",
    playhtVoiceId: process.env.PLAYHT_SHERLOCK_VOICE_ID || "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json",
    systemPrompt: "You are Sherlock Holmes, the world's greatest detective. You are brilliant, observant, and slightly arrogant. You love solving mysteries and deducing facts from small details. You speak in a British accent and often use phrases like 'Elementary, my dear Watson' and 'The game is afoot!'"
  },
  gandalf: {
    name: "Gandalf the Grey",
    description: "The wise wizard from Middle-earth",
    personality: "Wise, mysterious, and powerful. Speaks in riddles and ancient wisdom.",
    openaiVoice: "echo",
    playhtVoiceId: process.env.PLAYHT_GANDALF_VOICE_ID || "s3://voice-cloning-zero-shot/8b6c58dd-5c23-4e8f-8c0c-5c3b3b3b3b3b/male-cs/manifest.json",
    systemPrompt: "You are Gandalf the Grey, a wise and powerful wizard from Middle-earth. You are mysterious, knowledgeable about ancient lore, and speak with wisdom and authority. You often use phrases like 'You shall not pass!' and 'All we have to decide is what to do with the time that is given us.'"
  },
  tony: {
    name: "Tony Stark",
    description: "The genius billionaire playboy philanthropist",
    personality: "Witty, brilliant, and confident. Loves technology and making jokes.",
    openaiVoice: "fable",
    playhtVoiceId: process.env.PLAYHT_TONY_VOICE_ID || "s3://voice-cloning-zero-shot/7c3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b/male-cs/manifest.json",
    systemPrompt: "You are Tony Stark, the genius billionaire playboy philanthropist. You are witty, brilliant, and confident. You love technology, making jokes, and being sarcastic. You often reference your suits, technology, and use phrases like 'I am Iron Man' and 'Sometimes you gotta run before you can walk.'"
  },
  yoda: {
    name: "Master Yoda",
    description: "The wise Jedi Master",
    personality: "Wise, patient, and speaks in a unique word order.",
    openaiVoice: "onyx",
    playhtVoiceId: process.env.PLAYHT_YODA_VOICE_ID || "s3://voice-cloning-zero-shot/9d3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b/male-cs/manifest.json",
    systemPrompt: "You are Master Yoda, the wise Jedi Master. You are patient, wise, and speak in a unique word order (object-subject-verb). You often use phrases like 'Do or do not, there is no try' and 'Fear is the path to the dark side.'"
  },
  hermione: {
    name: "Hermione Granger",
    description: "The brilliant witch from Hogwarts",
    personality: "Intelligent, logical, and slightly bossy. Loves books and following rules.",
    openaiVoice: "nova",
    playhtVoiceId: process.env.PLAYHT_HERMIONE_VOICE_ID || "s3://voice-cloning-zero-shot/1e3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b/female-cs/manifest.json",
    systemPrompt: "You are Hermione Granger, the brilliant witch from Hogwarts. You are intelligent, logical, and slightly bossy. You love books, learning, and following rules. You often use phrases like 'It's leviosa, not leviosar!' and 'I've read about this in Hogwarts: A History.'"
  }
};

// Analytics tracking
async function trackAnalytics(event, data) {
  try {
    const { error } = await supabase
      .from('analytics')
      .insert([
        {
          event,
          data,
          timestamp: new Date().toISOString(),
          user_agent: data.userAgent || 'unknown'
        }
      ]);
    
    if (error) console.error('Analytics error:', error);
  } catch (error) {
    console.error('Failed to track analytics:', error);
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    voice_provider: 'PlayHT'
  });
});

app.get('/api/characters', (req, res) => {
  res.json(characters);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, characterId, sessionId } = req.body;
    
    if (!message || !characterId) {
      return res.status(400).json({ error: 'Message and character ID are required' });
    }

    const character = characters[characterId];
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }

    // Track chat analytics
    trackAnalytics('chat_message', {
      characterId,
      sessionId,
      messageLength: message.length,
      userAgent: req.headers['user-agent']
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o as requested
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
    
    // Store conversation in Supabase
    try {
      const { error } = await supabase
        .from('conversations')
        .insert([
          {
            session_id: sessionId || uuidv4(),
            character_id: characterId,
            user_message: message,
            ai_response: response,
            timestamp: new Date().toISOString()
          }
        ]);
      
      if (error) console.error('Database error:', error);
    } catch (dbError) {
      console.error('Failed to store conversation:', dbError);
    }
    
    res.json({
      response,
      character: character,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || uuidv4()
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

    // Track voice input analytics
    trackAnalytics('voice_input', {
      fileSize: req.file.size,
      userAgent: req.headers['user-agent']
    });

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

// PlayHT Text-to-Speech
app.post('/api/text-to-speech/playht', async (req, res) => {
  try {
    const { text, characterId } = req.body;
    
    if (!text || !characterId) {
      return res.status(400).json({ error: 'Text and character ID are required' });
    }

    const character = characters[characterId];
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }

    if (!process.env.PLAYHT_API_KEY || !process.env.PLAYHT_USER_ID) {
      return res.status(500).json({ error: 'PlayHT API credentials not configured' });
    }

    // PlayHT API call
    const response = await axios.post(
      'https://play.ht/api/v2/tts',
      {
        text: text,
        voice: character.playhtVoiceId,
        quality: "medium",
        output_format: "mp3",
        speed: 1,
        sample_rate: 24000
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
          'X-User-ID': process.env.PLAYHT_USER_ID
        },
        responseType: 'arraybuffer'
      }
    );

    // Store audio in Supabase Storage
    const fileName = `${uuidv4()}.mp3`;
    try {
      const { error } = await supabase.storage
        .from('voice-clips')
        .upload(fileName, response.data, {
          contentType: 'audio/mpeg'
        });
      
      if (error) console.error('Storage error:', error);
    } catch (storageError) {
      console.error('Failed to store audio:', storageError);
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length,
    });
    
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('PlayHT TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// OpenAI Text-to-Speech (fallback)
app.post('/api/text-to-speech/openai', async (req, res) => {
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
      voice: character.openaiVoice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('OpenAI TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Audio processing with FFmpeg
app.post('/api/audio/process', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const inputBuffer = req.file.buffer;
    const outputFileName = `${uuidv4()}.mp3`;

    // Process audio with FFmpeg
    ffmpeg(inputBuffer)
      .toFormat('mp3')
      .audioBitrate(128)
      .on('end', async () => {
        // Store processed audio
        try {
          const { error } = await supabase.storage
            .from('processed-audio')
            .upload(outputFileName, inputBuffer, {
              contentType: 'audio/mpeg'
            });
          
          if (error) console.error('Storage error:', error);
        } catch (storageError) {
          console.error('Failed to store processed audio:', storageError);
        }

        res.json({ 
          success: true, 
          fileName: outputFileName 
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({ error: 'Audio processing failed' });
      })
      .save(outputFileName);
  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Supabase: ${process.env.SUPABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🎤 PlayHT: ${process.env.PLAYHT_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
}); 