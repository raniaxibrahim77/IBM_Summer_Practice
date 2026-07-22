-- AutoMinutes seed data: 1 test user + 10 meetings (all July 2026)

WITH new_user AS (
INSERT INTO app_user (id, username, email, password, created_at)
VALUES (gen_random_uuid(), 'testuser', 'testuser@example.com', 'test1234', now())
    RETURNING id
    )
INSERT INTO meeting (id, title, description, meeting_datetime, processing_status, created_at, updated_at, owner_id)
SELECT gen_random_uuid(), title, description, meeting_datetime::timestamp, status, now(), now(), new_user.id
FROM new_user, (VALUES
                    ('Audit Kickoff', 'Initial audit sync', '2026-07-15 10:00:00', 'DONE'),
                    ('Vendor Review', 'Contract renewal discussion', '2026-07-17 13:00:00', 'DONE'),
                    ('Retro Q2', 'Quarterly retrospective', '2026-07-19 15:00:00', 'DONE'),
                    ('Morning Standup', 'Daily sync', '2026-07-20 08:30:00', 'DONE'),
                    ('8 AM Client Meeting', 'Client sync', '2026-07-20 09:00:00', 'NOT_STARTED'),
                    ('Design Review', 'Product team meeting', '2026-07-20 11:00:00', 'NOT_STARTED'),
                    ('Budget Check-in', 'Finance sync', '2026-07-21 14:00:00', 'NOT_STARTED'),
                    ('Sprint Planning', 'Backlog grooming', '2026-07-24 14:00:00', 'NOT_STARTED'),
                    ('Client Demo', 'Feature walkthrough', '2026-07-27 10:00:00', 'NOT_STARTED'),
                    ('Team Offsite Prep', 'Logistics planning', '2026-07-29 09:00:00', 'NOT_STARTED')
) AS meetings(title, description, meeting_datetime, status);

-- Part 2: attendees + links to existing meetings
WITH new_attendees AS (
INSERT INTO attendee (id, name, email)
VALUES
    (gen_random_uuid(), 'Alex Rivers', 'a.rivers@example.com'),
    (gen_random_uuid(), 'Elena Chen', 'e.chen@example.com'),
    (gen_random_uuid(), 'Marcus Thorne', 'm.thorne@example.com'),
    (gen_random_uuid(), 'Priya Nair', 'p.nair@example.com'),
    (gen_random_uuid(), 'Sam Diaz', 's.diaz@example.com')
    RETURNING id, name
    )
INSERT INTO meeting_attendee (meeting_id, attendee_id, role_in_meeting)
SELECT m.id, a.id, 'Participant'
FROM meeting m
         CROSS JOIN LATERAL (
    SELECT id FROM new_attendees ORDER BY random() LIMIT (2 + floor(random() * 3)::int)
    ) a;

-- Part 3: sample transcripts for meetings
INSERT INTO transcript (id, meeting_id, content, created_at, updated_at)
SELECT
    gen_random_uuid(),
    m.id,
    'This is a placeholder transcript for "' || m.title || '". ' ||
    'Attendees discussed the agenda, reviewed open items, and agreed on next steps. ' ||
    'Further details would go here in a real meeting transcript.',
    now(),
    now()
FROM meeting m
WHERE m.processing_status = 'DONE';