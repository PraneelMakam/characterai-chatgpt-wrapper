# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### 1. Set up Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and add your OpenAI API key
# Replace 'your_openai_api_key_here' with your actual API key
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Start the Application
```bash
# Start both server and client
npm run dev
```

### 4. Open Your Browser
Navigate to `http://localhost:3000`

## 🔑 Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## 🎯 Features You Can Test

- **Character Selection**: Choose from 5 pre-configured characters
- **Text Chat**: Type messages and get AI responses
- **Voice Input**: Click the microphone button to speak
- **Voice Output**: Characters respond with their unique voices
- **Mobile Responsive**: Works on phones and tablets

## 🐛 Troubleshooting

### "OpenAI API Key not configured"
- Make sure you've added your API key to the `.env` file
- Restart the server after changing the `.env` file

### Voice recording not working
- Allow microphone permissions in your browser
- Use HTTPS in production (required for media access)

### Build errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (v16 or higher required)

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel
```

### Heroku
```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_api_key
git push heroku main
```

## 📱 Mobile Testing

The app is fully responsive and works great on mobile devices. Test voice features on your phone for the best experience!

---

**Need help?** Check the main README.md for detailed documentation. 