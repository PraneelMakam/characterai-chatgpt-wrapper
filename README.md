# CharacterAI ChatGPT Wrapper

A full-stack web application that provides a ChatGPT wrapper with AI character voices and voice dictation capabilities. Chat with your favorite fictional characters using both text and voice input/output.

## 🌟 Features

- **AI Character Voices**: Pre-configured fictional characters with unique personalities and voices
- **Voice Dictation**: Speak to characters using speech-to-text
- **Text-to-Speech**: Characters respond with their unique voices
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Real-time Chat**: Instant messaging with AI characters
- **Character Selection**: Choose from multiple fictional characters
- **Mobile Responsive**: Works perfectly on all devices

## 🎭 Available Characters

- **Sherlock Holmes**: The brilliant detective from 221B Baker Street
- **Gandalf the Grey**: The wise wizard from Middle-earth
- **Tony Stark**: The genius billionaire playboy philanthropist
- **Master Yoda**: The wise Jedi Master
- **Hermione Granger**: The brilliant witch from Hogwarts

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/characterai-chatgpt-wrapper.git
   cd characterai-chatgpt-wrapper
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **OpenAI API** - AI chat and voice services
- **Socket.io** - Real-time communication
- **Multer** - File upload handling

### Frontend
- **React** - UI framework
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

## 📁 Project Structure

```
characterai-chatgpt-wrapper/
├── server/
│   └── index.js              # Express server with API routes
├── client/
│   ├── public/
│   │   ├── index.html        # Main HTML file
│   │   └── manifest.json     # PWA manifest
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Component styles
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Global styles
│   └── package.json         # Client dependencies
├── package.json             # Server dependencies
├── env.example             # Environment variables template
└── README.md               # Project documentation
```

## 🔧 API Endpoints

### Characters
- `GET /api/characters` - Get all available characters

### Chat
- `POST /api/chat` - Send message to AI character
  - Body: `{ message: string, characterId: string }`

### Voice
- `POST /api/speech-to-text` - Convert audio to text
  - Body: FormData with audio file
- `POST /api/text-to-speech` - Convert text to speech
  - Body: `{ text: string, characterId: string }`

## 🎨 Customization

### Adding New Characters

1. **Edit `server/index.js`**
   Add a new character to the `characters` object:

   ```javascript
   const characters = {
     // ... existing characters
     newCharacter: {
       name: "Character Name",
       description: "Character description",
       personality: "Character personality traits",
       voice: "alloy", // OpenAI voice: alloy, echo, fable, onyx, nova, shimmer
       systemPrompt: "You are [character name]. [detailed personality and behavior instructions]"
     }
   };
   ```

2. **Voice Options**
   - `alloy` - Balanced, natural voice
   - `echo` - Deep, authoritative voice
   - `fable` - Warm, friendly voice
   - `onyx` - Serious, professional voice
   - `nova` - Bright, energetic voice
   - `shimmer` - Soft, gentle voice

### Styling

The app uses CSS custom properties and modern styling. Main styles are in:
- `client/src/index.css` - Global styles
- `client/src/App.css` - Component-specific styles

## 🚀 Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

### Option 2: Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**
   ```bash
   heroku config:set OPENAI_API_KEY=your_api_key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Railway

1. **Connect your GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically**

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT and voice APIs
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
   - Try using HTTPS (required for media access)

3. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **CORS errors**
   - Ensure the server is running on the correct port
   - Check that the client proxy is configured correctly

### Support

If you encounter any issues, please:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information

## 📊 Performance

- **Frontend**: Optimized React components with lazy loading
- **Backend**: Efficient API design with proper error handling
- **Voice**: Stream processing for real-time audio conversion
- **UI**: Smooth 60fps animations with hardware acceleration

---

**Made with ❤️ for AI enthusiasts and character lovers everywhere!**