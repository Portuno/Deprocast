-- Insert sample calendar events for testing
-- Note: Replace 'your-user-id-here' with an actual user ID from your auth.users table

-- Sample events for the current week
INSERT INTO calendar_events (user_id, title, date, time, type, description, duration_minutes) VALUES
('your-user-id-here', 'Team Standup Meeting', CURRENT_DATE, '09:00', 'meeting', 'Daily team sync to discuss progress and blockers', 30),
('your-user-id-here', 'Deep Focus Session', CURRENT_DATE, '10:00', 'focus', 'Concentrated work on the main project', 90),
('your-user-id-here', 'Lunch Break', CURRENT_DATE, '12:00', 'break', 'Take a break and recharge', 60),
('your-user-id-here', 'Code Review', CURRENT_DATE, '14:00', 'task', 'Review pull requests and provide feedback', 45),
('your-user-id-here', 'Project Planning', CURRENT_DATE + INTERVAL '1 day', '10:00', 'meeting', 'Weekly project planning and goal setting', 60),
('your-user-id-here', 'Design Workshop', CURRENT_DATE + INTERVAL '2 days', '13:00', 'focus', 'Creative design session for new features', 120),
('your-user-id-here', 'Client Call', CURRENT_DATE + INTERVAL '3 days', '15:00', 'meeting', 'Client consultation and requirements discussion', 45),
('your-user-id-here', 'Documentation Update', CURRENT_DATE + INTERVAL '4 days', '11:00', 'task', 'Update project documentation and README', 60),
('your-user-id-here', 'Testing Session', CURRENT_DATE + INTERVAL '5 days', '14:00', 'focus', 'Comprehensive testing of new features', 90),
('your-user-id-here', 'Weekly Review', CURRENT_DATE + INTERVAL '6 days', '16:00', 'meeting', 'Review week progress and plan next week', 30);

-- Note: After running this, you'll need to replace 'your-user-id-here' with an actual user ID
-- You can get your user ID by running: SELECT id FROM auth.users LIMIT 1;
