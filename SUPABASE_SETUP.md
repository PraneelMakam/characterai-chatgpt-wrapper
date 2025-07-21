# Supabase Setup Guide

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready

### 2. Get Your Credentials

In your Supabase dashboard, go to Settings > API and copy:
- **Project URL** (SUPABASE_URL)
- **Anon Key** (SUPABASE_ANON_KEY)
- **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)

### 3. Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Analytics table
CREATE TABLE analytics (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  character_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (for future auth features)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX idx_analytics_event ON analytics(event);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_character_id ON conversations(character_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics (allow all operations for now)
CREATE POLICY "Allow all operations on analytics" ON analytics
  FOR ALL USING (true);

-- Create policies for conversations (allow all operations for now)
CREATE POLICY "Allow all operations on conversations" ON conversations
  FOR ALL USING (true);

-- Create policies for users (allow all operations for now)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);
```

### 4. Create Storage Buckets

In your Supabase dashboard, go to Storage and create these buckets:

#### Voice Clips Bucket
- **Name**: `voice-clips`
- **Public**: `false`
- **File size limit**: `10MB`
- **Allowed MIME types**: `audio/*`

#### Processed Audio Bucket
- **Name**: `processed-audio`
- **Public**: `false`
- **File size limit**: `10MB`
- **Allowed MIME types**: `audio/*`

### 5. Storage Policies

Run these SQL commands to set up storage policies:

```sql
-- Allow authenticated users to upload voice clips
CREATE POLICY "Allow uploads to voice-clips" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'voice-clips');

-- Allow authenticated users to read voice clips
CREATE POLICY "Allow reads from voice-clips" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice-clips');

-- Allow authenticated users to upload processed audio
CREATE POLICY "Allow uploads to processed-audio" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'processed-audio');

-- Allow authenticated users to read processed audio
CREATE POLICY "Allow reads from processed-audio" ON storage.objects
  FOR SELECT USING (bucket_id = 'processed-audio');
```

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📊 Analytics Dashboard (Optional)

### Create a View for Analytics

```sql
-- Create a view for character usage analytics
CREATE VIEW character_analytics AS
SELECT 
  character_id,
  COUNT(*) as message_count,
  AVG(LENGTH(user_message)) as avg_message_length,
  DATE_TRUNC('day', timestamp) as date
FROM conversations
GROUP BY character_id, DATE_TRUNC('day', timestamp)
ORDER BY date DESC, message_count DESC;

-- Create a view for event analytics
CREATE VIEW event_analytics AS
SELECT 
  event,
  COUNT(*) as event_count,
  DATE_TRUNC('hour', timestamp) as hour
FROM analytics
GROUP BY event, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC, event_count DESC;
```

## 🔐 Authentication Setup (Future Feature)

### Enable Email Auth

1. Go to Authentication > Settings
2. Enable "Enable email confirmations"
3. Configure email templates if needed

### Create Auth Policies

```sql
-- Update policies to use auth
DROP POLICY "Allow all operations on analytics" ON analytics;
DROP POLICY "Allow all operations on conversations" ON conversations;

-- Analytics policies with auth
CREATE POLICY "Users can insert analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their analytics" ON analytics
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Conversation policies with auth
CREATE POLICY "Users can insert conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

## 🚀 Testing Your Setup

### Test Database Connection

```javascript
// Test script
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
```

### Test Storage

```javascript
// Test storage upload
async function testStorage() {
  try {
    const testFile = new Blob(['test'], { type: 'audio/mpeg' });
    const { data, error } = await supabase.storage
      .from('voice-clips')
      .upload('test.mp3', testFile);
    
    if (error) throw error;
    console.log('✅ Storage upload successful');
  } catch (error) {
    console.error('❌ Storage upload failed:', error);
  }
}

testStorage();
```

## 📈 Monitoring

### Set up Database Monitoring

1. Go to your Supabase dashboard
2. Check the "Database" section for:
   - Query performance
   - Connection usage
   - Storage usage

### Set up Alerts

1. Go to Settings > Alerts
2. Set up alerts for:
   - High database usage
   - Storage limits
   - Failed queries

## 🔒 Security Best Practices

1. **Never expose service role key** in client-side code
2. **Use RLS policies** to restrict data access
3. **Regularly rotate API keys**
4. **Monitor usage** and set up alerts
5. **Backup your data** regularly

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check your environment variables
   - Ensure you're using the correct key type

2. **"Permission denied"**
   - Check your RLS policies
   - Verify bucket permissions

3. **"Bucket not found"**
   - Create the storage buckets
   - Check bucket names in your code

4. **"Table does not exist"**
   - Run the SQL setup commands
   - Check table names in your code

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Your Supabase setup is now complete! 🎉** 