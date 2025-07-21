# CharacterAI ChatGPT Wrapper v2.0

A full-stack web application that provides a ChatGPT wrapper with AI character voices and voice dictation capabilities. Chat with your favorite fictional characters using both text and voice input/output with realistic AI voices.

## 🌟 Features

- **AI Character Voices**: Pre-configured fictional characters with unique personalities and voices
- **Realistic Voice AI**: ElevenLabs integration for ultra-realistic character voices
- **Voice Dictation**: Speak to characters using speech-to-text
- **Text-to-Speech**: Characters respond with their unique voices
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Chat**: Instant messaging with AI characters
- **Character Selection**: Choose from multiple fictional characters
- **Mobile Responsive**: Works perfectly on all devices
- **Analytics**: Track usage and conversations
- **Audio Processing**: FFmpeg integration for audio enhancement

## 🎭 Available Characters

- **Sherlock Holmes**: The brilliant detective from 221B Baker Street
- **Gandalf the Grey**: The wise wizard from Middle-earth
- **Tony Stark**: The genius billionaire playboy philanthropist
- **Master Yoda**: The wise Jedi Master
- **Hermione Granger**: The brilliant witch from Hogwarts

## 🏗️ Architecture

### **Frontend**
- **React** - Modern UI framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **Hosting**: Vercel

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **OpenAI GPT-4o** - Advanced AI chat
- **ElevenLabs** - Realistic voice synthesis
- **FFmpeg** - Audio processing
- **Hosting**: Render/Fly.io

### **Database & Storage**
- **Supabase** - PostgreSQL database
- **Supabase Storage** - File storage
- **Analytics** - Usage tracking

### **Audio Pipeline**
- **Web Audio API** - Browser audio handling
- **FFmpeg** - Audio processing and conversion
- **ElevenLabs** - High-quality voice synthesis

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- ElevenLabs API key (optional)
- Supabase account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/characterai-chatgpt-wrapper.git
   cd characterai-chatgpt-wrapper
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install && cd ..
   
   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```bash
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional but recommended
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase (Optional)**
   - Follow the [Supabase Setup Guide](SUPABASE_SETUP.md)
   - This enables analytics and conversation storage

5. **Start the development server**
   ```bash
   # Start backend
   cd backend && npm run dev
   
   # In another terminal, start frontend
   cd client && npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Technology Stack

### **Chat API**
- **OpenAI GPT-4o** - Latest AI model for intelligent conversations

### **Voice AI**
- **ElevenLabs** - Ultra-realistic voice synthesis
- **OpenAI TTS** - Fallback voice option
- **PlayHT** - Alternative voice provider (configurable)

### **Audio Pipeline**
- **FFmpeg** - Professional audio processing
- **Web Audio API** - Browser audio handling
- **MediaRecorder API** - Voice recording

### **Hosting**
- **Vercel** - Frontend hosting
- **Render/Fly.io** - Backend API hosting

### **Database (Optional)**
- **Supabase** - PostgreSQL database
- **Supabase Storage** - File storage
- **Analytics** - Usage tracking

## 📁 Project Structure

```
characterai-chatgpt-wrapper/
├── backend/
│   ├── index.js              # Express server with enhanced features
│   └── package.json          # Backend dependencies
├── client/
│   ├── public/
│   │   ├── index.html        # Main HTML file
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Component styles
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   └── package.json         # Frontend dependencies
├── package.json             # Root dependencies
├── env.example             # Environment variables template
├── vercel.json             # Vercel deployment config
├── README.md               # Project documentation
├── SETUP.md                # Quick start guide
├── DEPLOYMENT.md           # Deployment instructions
└── SUPABASE_SETUP.md       # Supabase setup guide
```

## 🔧 API Endpoints

### Characters
- `GET /api/characters` - Get all available characters

### Chat
- `POST /api/chat` - Send message to AI character
  - Body: `{ message: string, characterId: string, sessionId: string }`

### Voice
- `POST /api/speech-to-text` - Convert audio to text
  - Body: FormData with audio file
- `POST /api/text-to-speech/elevenlabs` - ElevenLabs TTS
  - Body: `{ text: string, characterId: string }`
- `POST /api/text-to-speech/openai` - OpenAI TTS (fallback)
  - Body: `{ text: string, characterId: string }`

### Audio Processing
- `POST /api/audio/process` - Process audio with FFmpeg
  - Body: FormData with audio file

### Analytics
- `GET /api/analytics` - Get usage analytics
- `GET /api/health` - Health check

## 🎨 Customization

### Adding New Characters

1. **Edit `backend/index.js`**
   Add a new character to the `characters` object:

   ```javascript
   const characters = {
     // ... existing characters
     newCharacter: {
       name: "Character Name",
       description: "Character description",
       personality: "Character personality traits",
       openaiVoice: "alloy", // OpenAI voice
       elevenLabsVoiceId: "your_elevenlabs_voice_id",
       systemPrompt: "You are [character name]. [detailed personality and behavior instructions]"
     }
   };
   ```

2. **Voice Options**
   - **ElevenLabs**: Ultra-realistic voices (recommended)
   - **OpenAI**: Standard voices (fallback)
   - **PlayHT**: Alternative voice provider

### Voice Configuration

#### ElevenLabs Setup
1. Get API key from [ElevenLabs](https://elevenlabs.io)
2. Add to environment variables
3. Configure voice IDs for each character

#### OpenAI Voice Options
- `alloy` - Balanced, natural voice
- `echo` - Deep, authoritative voice
- `fable` - Warm, friendly voice
- `onyx` - Serious, professional voice
- `nova` - Bright, energetic voice
- `shimmer` - Soft, gentle voice

## 🚀 Deployment

### Frontend (Vercel)

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables**
   - `REACT_APP_API_URL`: Your backend URL

### Backend (Render/Fly.io)

#### Option 1: Render
1. Go to [Render.com](https://render.com/)
2. Create new Web Service
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

#### Option 2: Fly.io
1. Install Fly CLI: `npm install -g @flyio/fly`
2. Create app: `fly launch`
3. Set secrets: `fly secrets set OPENAI_API_KEY=your_key`
4. Deploy: `fly deploy`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | No |
| `SUPABASE_URL` | Supabase project URL | No |
| `SUPABASE_ANON_KEY` | Supabase anon key | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `NODE_ENV` | Environment (production) | No |

## 📊 Analytics & Monitoring

### Supabase Analytics
- Track user interactions
- Monitor character usage
- Store conversation history
- Performance metrics

### Built-in Monitoring
- Request rate limiting
- Error tracking
- Health checks
- Performance monitoring

## 🔒 Security Features

- **Rate Limiting**: Prevent abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Sanitize user inputs
- **Environment Variables**: Secure API keys
- **HTTPS Required**: Secure voice features

## 💰 Cost Optimization

### OpenAI API
- Monitor usage in OpenAI dashboard
- Set up billing alerts
- Use GPT-4o-mini for cost efficiency

### ElevenLabs
- Free tier available (10,000 characters/month)
- Monitor usage in ElevenLabs dashboard
- Optimize voice settings

### Hosting
- **Vercel**: Free tier available
- **Render**: Free tier available
- **Supabase**: Free tier available

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o and TTS APIs
- ElevenLabs for realistic voice synthesis
- Supabase for database and storage
- The React and Node.js communities
- All the fictional characters that inspired this project

## 🐛 Troubleshooting

### Common Issues

1. **"OpenAI API Key not configured"**
   - Make sure you've set the `OPENAI_API_KEY` in your `.env` file
   - Verify your API key is valid and has sufficient credits

2. **Voice recording not working**
   - Ensure your browser supports MediaRecorder API
   - Check microphone permissions
   - Use HTTPS (required for media access)

3. **ElevenLabs voice not working**
   - Check your ElevenLabs API key
   - Verify voice IDs are correct
   - Check your ElevenLabs usage limits

4. **Supabase connection issues**
   - Verify your Supabase credentials
   - Check your database tables are created
   - Ensure RLS policies are configured

5. **Build errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Support

If you encounter any issues, please:
1. Check the troubleshooting section above
2. Review the setup guides
3. Search existing issues on GitHub
4. Create a new issue with detailed information

## 📈 Performance

- **Frontend**: Optimized React components with lazy loading
- **Backend**: Efficient API design with proper error handling
- **Voice**: Stream processing for real-time audio conversion
- **Database**: Indexed queries for fast performance
- **UI**: Smooth 60fps animations with hardware acceleration

---

**Made with ❤️ for AI enthusiasts and character lovers everywhere!**

**Upgraded to v2.0 with realistic voices, analytics, and enhanced features! 🎤✨**