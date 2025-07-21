# Voice Provider Setup Guide

## 🎤 Dual Voice Provider System

Your CharacterAI ChatGPT wrapper now supports **both ElevenLabs and PlayHT** simultaneously! This gives you maximum flexibility and the best voice quality for different use cases.

## 🏆 Why Dual Voice Providers?

### **ElevenLabs Advantages:**
- **10,000 free characters** per month
- **High-quality voices** with excellent realism
- **Voice cloning** capabilities
- **Established API** with good documentation
- **Best for general use**

### **PlayHT Advantages:**
- **800+ voices** (vs 100+ in ElevenLabs)
- **Character voices** - specialized character impersonations
- **Better pricing** for character work
- **Character-focused** voice models
- **Best for character impersonations**

### **Smart Fallback System:**
1. **Primary**: ElevenLabs (if configured)
2. **Alternative**: PlayHT (if configured)
3. **Fallback**: OpenAI TTS (always available)
4. **Graceful**: No voice if all fail

## 🚀 Getting Started

### 1. Choose Your Voice Providers

You can use:
- **ElevenLabs only** (recommended for general use)
- **PlayHT only** (recommended for character voices)
- **Both providers** (maximum flexibility)
- **OpenAI only** (basic fallback)

### 2. Set Up Environment Variables

Copy the example file and configure your providers:

```bash
cp env.example .env
```

Edit `.env` with your API keys:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs (Optional)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# PlayHT (Optional)
PLAYHT_API_KEY=your_playht_api_key_here
PLAYHT_USER_ID=your_playht_user_id_here
```

## 🎭 ElevenLabs Setup

### 1. Create ElevenLabs Account

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. **Go to your ElevenLabs Dashboard**
2. **Navigate to Profile Settings**
3. **Copy your API key**

### 3. Find Character Voices

1. **Browse ElevenLabs Voice Library**
   - Go to [ElevenLabs Voices](https://elevenlabs.io/voice-library)
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
   ELEVENLABS_SHERLOCK_VOICE_ID=your_chosen_voice_id
   ELEVENLABS_GANDALF_VOICE_ID=your_chosen_voice_id
   # ... etc
   ```

### 4. ElevenLabs Pricing

- **Free Tier**: 10,000 characters per month
- **Starter**: $22/month - 30,000 characters
- **Creator**: $99/month - 250,000 characters
- **Independent Publisher**: $330/month - 1,000,000 characters
- **Growing Business**: $1,320/month - 4,000,000 characters

## 🎪 PlayHT Setup

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

### 3. Find Character Voices

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

### 4. PlayHT Pricing

- **Free Tier**: 1,000 characters per month
- **Starter**: $14/month - 50,000 characters
- **Creator**: $39/month - 250,000 characters
- **Unlimited**: $99/month - Unlimited characters

## 🔧 API Integration

### How It Works

The app automatically detects available providers and offers smart fallback:

```javascript
// Health check shows available providers
GET /api/health
{
  "voice_providers": {
    "elevenlabs": true,
    "playht": true,
    "openai": true
  }
}

// Smart endpoint routing
POST /api/text-to-speech/elevenlabs  // ElevenLabs
POST /api/text-to-speech/playht      // PlayHT
POST /api/text-to-speech/openai      // OpenAI fallback
```

### Voice Provider Selection

The frontend automatically:
1. **Checks available providers** on startup
2. **Sets default provider** based on availability
3. **Offers manual switching** between providers
4. **Provides automatic fallback** on errors

## 🎯 Testing Your Setup

### 1. Test Provider Availability

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "voice_providers": {
    "elevenlabs": true,
    "playht": true,
    "openai": true
  }
}
```

### 2. Test Individual Providers

#### ElevenLabs Test
```bash
curl -X POST http://localhost:5000/api/text-to-speech/elevenlabs \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test!", "characterId": "sherlock"}'
```

#### PlayHT Test
```bash
curl -X POST http://localhost:5000/api/text-to-speech/playht \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test!", "characterId": "sherlock"}'
```

### 3. Test Character Voices

1. **Start your application**
2. **Select a character**
3. **Send a message**
4. **Check if voice plays correctly**
5. **Try switching voice providers**

## 🎨 Voice Provider Comparison

| Feature | ElevenLabs | PlayHT | OpenAI |
|---------|------------|--------|--------|
| **Voice Variety** | 100+ voices | 800+ voices | 6 voices |
| **Character Voices** | ✅ Good | ✅ Excellent | ❌ Generic |
| **Quality** | High | High | Medium |
| **Free Tier** | 10,000 chars | 1,000 chars | 500 chars |
| **Cost** | Pay per character | Pay per character | Pay per character |
| **API Complexity** | Simple | Simple | Simple |
| **Voice Cloning** | ✅ Yes | ✅ Yes | ❌ No |
| **Best For** | **General use** | **Character voices** | **Fallback** |

## 💰 Cost Optimization

### Recommended Setup

#### For Character Voices (Best Quality)
```bash
# Primary: PlayHT (character voices)
PLAYHT_API_KEY=your_playht_key
PLAYHT_USER_ID=your_playht_user_id

# Fallback: ElevenLabs (general voices)
ELEVENLABS_API_KEY=your_elevenlabs_key

# Backup: OpenAI (always available)
OPENAI_API_KEY=your_openai_key
```

#### For General Use (Best Value)
```bash
# Primary: ElevenLabs (more free characters)
ELEVENLABS_API_KEY=your_elevenlabs_key

# Alternative: PlayHT (character voices)
PLAYHT_API_KEY=your_playht_key
PLAYHT_USER_ID=your_playht_user_id

# Backup: OpenAI (always available)
OPENAI_API_KEY=your_openai_key
```

### Cost Management Tips

1. **Monitor Usage**
   - Check provider dashboards regularly
   - Set up usage alerts
   - Track character count

2. **Optimize Settings**
   - Use appropriate quality settings
   - Cache frequently used audio
   - Implement proper error handling

3. **Smart Fallback**
   - Use free tiers first
   - Fallback to cheaper providers
   - Monitor costs per provider

## 🐛 Troubleshooting

### Common Issues

1. **"API credentials not configured"**
   - Check your environment variables
   - Ensure API keys are correct
   - Restart your server after changes

2. **"Voice provider not available"**
   - Check provider status in health endpoint
   - Verify API keys are valid
   - Check usage limits

3. **"Voice quality issues"**
   - Try different voice IDs
   - Check provider settings
   - Test with different characters

4. **"Fallback not working"**
   - Ensure OpenAI API key is set
   - Check provider availability
   - Verify endpoint routing

### Error Codes

#### ElevenLabs
- **401**: Invalid API key
- **429**: Rate limit exceeded
- **500**: Server error

#### PlayHT
- **401**: Invalid API key or User ID
- **403**: Insufficient permissions
- **429**: Rate limit exceeded
- **500**: Server error

### Provider-Specific Issues

#### ElevenLabs Issues
- **Voice not found**: Check voice ID format
- **Quality issues**: Adjust stability/similarity settings
- **Rate limiting**: Check usage dashboard

#### PlayHT Issues
- **Voice not found**: Verify voice ID format
- **Authentication**: Check both API key and User ID
- **Usage limits**: Monitor character count

## 🚀 Production Deployment

### Environment Variables

Set these in your hosting platform:

```bash
# Required
OPENAI_API_KEY=your_production_openai_key

# ElevenLabs (Optional)
ELEVENLABS_API_KEY=your_production_elevenlabs_key

# PlayHT (Optional)
PLAYHT_API_KEY=your_production_playht_key
PLAYHT_USER_ID=your_production_playht_user_id
```

### Monitoring

- Set up usage alerts for all providers
- Monitor voice quality and user satisfaction
- Track costs per provider
- Monitor fallback usage

## 📈 Best Practices

### 1. Voice Selection
- **ElevenLabs**: Choose voices that match character personalities
- **PlayHT**: Use specialized character voices when available
- **Testing**: Test voices with character-specific phrases

### 2. Performance
- **Caching**: Cache frequently used audio
- **Quality**: Use appropriate quality settings
- **Error Handling**: Implement proper fallback

### 3. User Experience
- **Provider Switching**: Allow users to choose providers
- **Status Indicators**: Show provider availability
- **Graceful Fallback**: Handle errors smoothly

### 4. Cost Management
- **Monitor Usage**: Track usage across all providers
- **Optimize Settings**: Use cost-effective quality settings
- **Smart Routing**: Route to cheapest available provider

## 🎉 Success Indicators

Your dual voice provider setup is working when:

✅ **Health endpoint** shows available providers
✅ **Voice switching** works in the UI
✅ **Automatic fallback** handles errors
✅ **Character voices** sound appropriate
✅ **Cost monitoring** is in place
✅ **User satisfaction** is high

---

**Your dual voice provider setup is now complete! 🎉**

**Enjoy the best of both worlds - ElevenLabs for general use and PlayHT for character voices! 🎤✨** 