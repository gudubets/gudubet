-- Create push tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create social profiles table
CREATE TABLE IF NOT EXISTS user_social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  total_wins INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  friend_count INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Create user activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admin_id UUID,
  status VARCHAR(20) DEFAULT 'waiting',
  subject VARCHAR(200) NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  last_message TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  sender_avatar TEXT,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push tokens
CREATE POLICY "Users can manage their own push tokens" ON user_push_tokens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all push tokens" ON user_push_tokens
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
  );

-- RLS Policies for social profiles
CREATE POLICY "Users can view all social profiles" ON user_social_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own social profile" ON user_social_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage their own friendships" ON friendships
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for friend requests
CREATE POLICY "Users can view their friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received friend requests" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for user activities
CREATE POLICY "Users can view public activities" ON user_activities
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat rooms
CREATE POLICY "Users can view their own chat rooms" ON chat_rooms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat rooms" ON chat_rooms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat rooms" ON chat_rooms
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can update assigned chat rooms" ON chat_rooms
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
  );

-- RLS Policies for chat messages
CREATE POLICY "Users can view messages in their chat rooms" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_room_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can send messages in their chat rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_room_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all chat messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can send messages in any chat room" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true)
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_social_profiles_username ON user_social_profiles(username);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(chat_room_id);