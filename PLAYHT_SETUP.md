# PlayHT Setup Guide

## 🎤 Why PlayHT?

PlayHT is the **better choice** for character-based voice synthesis because:

- **800+ Voices**: Massive voice library
- **Character Voices**: Specialized character impersonations
- **Better Pricing**: More generous free tier
- **Higher Quality**: Often more realistic for characters
- **Easier Integration**: Simpler API
- **No Credit System**: Pay per character, not credits

## 🚀 Getting Started with PlayHT

### 1. Create PlayHT Account

1. Go to [PlayHT](https://play.ht)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Credentials

1. **Go to your PlayHT Dashboard**
2. **Navigate to API Access**
3. **Copy your credentials**:
   - **API Key** (Secret Key)
   - **User ID** (Public User ID)

### 3. Set Up Environment Variables

Add these to your `.env` file:

```bash
# PlayHT Configuration
PLAYHT_API_KEY=your_playht_api_key_here
PLAYHT_USER_ID=your_playht_user_id_here
```

## 🎭 Character Voice Setup

### Default Character Voices

The app comes with pre-configured character voices:

```javascript
// Sherlock Holmes - British Detective
PLAYHT_SHERLOCK_VOICE_ID=s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json

// Gandalf - Wise Wizard
PLAYHT_GANDALF_VOICE_ID=s3://voice-cloning-zero-shot/8b6c58dd-5c23-4e8f-8c0c-5c3b3b3b3b3b/male-cs/manifest.json

// Tony Stark - Tech Genius
PLAYHT_TONY_VOICE_ID=s3://voice-cloning-zero-shot/7c3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b/male-cs/manifest.json

// Master Yoda - Jedi Master
PLAYHT_YODA_VOICE_ID=s3://voice-cloning-zero-shot/9d3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b/male-cs/manifest.json

// Hermione Granger - Brilliant Witch
PLAYHT_HERMIONE_VOICE_ID=s3://voice-cloning-zero-shot/1e3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b/female-cs/manifest.json
```

### Finding Better Character Voices

1. **Browse PlayHT Voice Library**
   - Go to [PlayHT Voices](https://play.ht/studio/voices)
   - Search for character names or descriptions
   - Listen to voice samples

2. **Popular Character Voice Categories**
   - **British Accents**: For Sherlock Holmes
   - **Wise/Old Voices**: For Gandalf
   - **Confident/Tech Voices**: For Tony Stark
   - **Unique/Strange Voices**: For Yoda
   - **Intelligent/Young Voices**: For Hermione

3. **Custom Voice IDs**
   Replace the default voice IDs in your `.env` file:

   ```bash
   PLAYHT_SHERLOCK_VOICE_ID=your_chosen_voice_id
   PLAYHT_GANDALF_VOICE_ID=your_chosen_voice_id
   # ... etc
   ```

## 🔧 API Integration

### How It Works

The app uses PlayHT's v2 API:

```javascript
// API Call Example
const response = await axios.post(
  'https://play.ht/api/v2/tts',
  {
    text: "Hello, I am Sherlock Holmes!",
    voice: "your_voice_id",
    quality: "medium",
    output_format: "mp3",
    speed: 1,
    sample_rate: 24000
  },
  {
    headers: {
      'Authorization': `Bearer ${PLAYHT_API_KEY}`,
      'X-User-ID': PLAYHT_USER_ID
    }
  }
);
```

### Voice Parameters

- **quality**: "low", "medium", "high", "premium"
- **output_format**: "mp3", "wav", "ogg"
- **speed**: 0.5 to 2.0 (1.0 is normal)
- **sample_rate**: 8000, 16000, 22050, 24000, 44100

## 💰 Pricing & Limits

### Free Tier
- **1,000 characters per month**
- **Basic voices available**
- **Standard quality**

### Paid Plans
- **Starter**: $14/month - 50,000 characters
- **Creator**: $39/month - 250,000 characters
- **Unlimited**: $99/month - Unlimited characters

### Cost Optimization
- Use "medium" quality for most cases
- Use "low" quality for testing
- Use "high" quality for important responses

## 🎯 Testing Your Setup

### 1. Test API Connection

```javascript
// Test script
const axios = require('axios');

async function testPlayHT() {
  try {
    const response = await axios.post(
      'https://play.ht/api/v2/tts',
      {
        text: "Hello, this is a test!",
        voice: "your_voice_id",
        quality: "low",
        output_format: "mp3"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PLAYHT_API_KEY}`,
          'X-User-ID': process.env.PLAYHT_USER_ID
        },
        responseType: 'arraybuffer'
      }
    );
    
    console.log('✅ PlayHT connection successful');
    console.log('Audio length:', response.data.length, 'bytes');
  } catch (error) {
    console.error('❌ PlayHT connection failed:', error.response?.data || error.message);
  }
}

testPlayHT();
```

### 2. Test Character Voices

1. **Start your application**
2. **Select a character**
3. **Send a message**
4. **Check if voice plays correctly**

### 3. Monitor Usage

- Check your PlayHT dashboard for usage
- Monitor character count
- Set up alerts for limits

## 🐛 Troubleshooting

### Common Issues

1. **"PlayHT API credentials not configured"**
   - Check your environment variables
   - Ensure both API key and User ID are set
   - Restart your server after changes

2. **"Invalid API key"**
   - Verify your API key is correct
   - Check if your account is active
   - Ensure you're using the right key type

3. **"Voice not found"**
   - Check your voice IDs are correct
   - Verify voices exist in your account
   - Use default voices for testing

4. **"Usage limit exceeded"**
   - Check your PlayHT usage dashboard
   - Upgrade your plan if needed
   - Use OpenAI fallback temporarily

5. **"Audio quality issues"**
   - Try different quality settings
   - Check your internet connection
   - Verify audio format compatibility

### Error Codes

- **401**: Invalid API key or User ID
- **403**: Insufficient permissions
- **429**: Rate limit exceeded
- **500**: Server error (try again)

## 🔄 Fallback System

The app includes automatic fallback:

1. **Primary**: PlayHT voices
2. **Fallback**: OpenAI TTS
3. **Graceful degradation**: No voice if both fail

## 📊 Voice Quality Comparison

| Feature | PlayHT | OpenAI |
|---------|--------|--------|
| Voice Variety | 800+ voices | 6 voices |
| Character Voices | ✅ Specialized | ❌ Generic |
| Quality | High | Medium |
| Cost | Pay per character | Pay per character |
| Free Tier | 1,000 chars | 500 chars |
| Customization | High | Low |

## 🎨 Voice Customization

### Advanced Settings

```javascript
// Custom voice settings
const voiceSettings = {
  text: "Your text here",
  voice: "your_voice_id",
  quality: "high",           // low, medium, high, premium
  output_format: "mp3",      // mp3, wav, ogg
  speed: 1.2,               // 0.5 to 2.0
  sample_rate: 24000,       // 8000, 16000, 22050, 24000, 44100
  emotion: "happy",         // Some voices support emotions
  voice_guidance: 1.0       // Voice similarity (0.1 to 2.0)
};
```

### Voice Cloning (Premium)

For even better character voices:

1. **Upload character audio samples**
2. **Train custom voice model**
3. **Use custom voice ID**
4. **Perfect character impersonation**

## 🚀 Production Deployment

### Environment Variables

Set these in your hosting platform:

```bash
PLAYHT_API_KEY=your_production_api_key
PLAYHT_USER_ID=your_production_user_id
```

### Monitoring

- Set up usage alerts
- Monitor voice quality
- Track user satisfaction
- Monitor costs

## 📈 Best Practices

1. **Voice Selection**
   - Choose voices that match character personalities
   - Test voices with character-specific phrases
   - Consider accent and age appropriateness

2. **Performance**
   - Use appropriate quality settings
   - Cache frequently used audio
   - Implement proper error handling

3. **User Experience**
   - Provide voice toggle option
   - Show voice provider indicator
   - Graceful fallback on errors

4. **Cost Management**
   - Monitor usage regularly
   - Set up billing alerts
   - Optimize voice settings

---

**Your PlayHT setup is now complete! 🎉**

**Enjoy ultra-realistic character voices! 🎤✨** 