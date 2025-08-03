-- Create user_actions table for comprehensive action logging
-- This will track every significant user action with timestamp and context

CREATE TABLE IF NOT EXISTS user_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    action_type VARCHAR(100) NOT NULL,
    context VARCHAR(255) NOT NULL,
    page_url VARCHAR(500),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_timestamp ON user_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_actions_context ON user_actions(context);

-- Add comments for documentation
COMMENT ON TABLE user_actions IS 'Comprehensive logging of all user actions in the admin dashboard';
COMMENT ON COLUMN user_actions.user_id IS 'ID of the user performing the action (NULL for anonymous actions)';
COMMENT ON COLUMN user_actions.session_id IS 'Browser session ID for tracking anonymous users';
COMMENT ON COLUMN user_actions.action_type IS 'Type of action: click, navigation, form_submit, data_view, etc.';
COMMENT ON COLUMN user_actions.context IS 'Page or section where action occurred';
COMMENT ON COLUMN user_actions.page_url IS 'Full URL where action was performed';
COMMENT ON COLUMN user_actions.details IS 'Additional action details as JSON';
COMMENT ON COLUMN user_actions.ip_address IS 'IP address of the user';
COMMENT ON COLUMN user_actions.user_agent IS 'Browser user agent string';