--for the calendar page (for now, just meetings)

WITH new_user AS (
INSERT INTO app_user (id, username, email, password, created_at)
VALUES (gen_random_uuid(), 'testuser', 'testuser@example.com', 'test1234', now())
    RETURNING id
    )
INSERT INTO meeting (id, title, description, meeting_datetime, processing_status, created_at, updated_at, owner_id)
SELECT gen_random_uuid(), title, description, meeting_datetime::timestamp, status, now(), now(), new_user.id
FROM new_user, (VALUES
                    ('Audit Kickoff', 'Initial audit sync', CURRENT_DATE - 5 || ' 10:00:00', 'DONE'),
                    ('Vendor Review', 'Contract renewal discussion', CURRENT_DATE - 3 || ' 13:00:00', 'DONE'),
                    ('Retro Q2', 'Quarterly retrospective', CURRENT_DATE - 1 || ' 15:00:00', 'DONE'),
                    ('Morning Standup', 'Daily sync', CURRENT_DATE || ' 08:30:00', 'DONE'),
                    ('8 AM Client Meeting', 'Client sync', CURRENT_DATE || ' 09:00:00', 'NOT_STARTED'),
                    ('Design Review', 'Product team meeting', CURRENT_DATE || ' 11:00:00', 'NOT_STARTED'),
                    ('Budget Check-in', 'Finance sync', CURRENT_DATE + 1 || ' 14:00:00', 'NOT_STARTED'),
                    ('Sprint Planning', 'Backlog grooming', CURRENT_DATE + 5 || ' 14:00:00', 'NOT_STARTED'),
                    ('Client Demo', 'Feature walkthrough', CURRENT_DATE + 8 || ' 10:00:00', 'NOT_STARTED'),
                    ('Team Offsite Prep', 'Logistics planning', CURRENT_DATE + 12 || ' 09:00:00', 'NOT_STARTED')
) AS meetings(title, description, meeting_datetime, status);