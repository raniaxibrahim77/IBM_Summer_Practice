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
INSERT INTO transcript (
    id,
    meeting_id,
    content,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    m.id,
    seed_transcript.content,
    now(),
    now()
FROM meeting m
         JOIN (
    VALUES
        (
            'Audit Kickoff',
            $audit$
                Meeting: Audit Kickoff
Date: July 15, 2026

                Participants: Alex, Elena, Marcus, and Priya

            Alex: Today we need to prepare for the internal audit scheduled to begin next Monday. We must make sure that all financial and security documents are ready.

            Elena: The financial reports for the second quarter are almost complete. I still need confirmation of the final expense figures from the finance department.

            Marcus: I reviewed the security documentation. The access-control report is complete, but the incident-response document has not been updated since last year.

Priya: The external auditors also requested a list of users with administrative access. We should verify that the list is current.

Alex: Elena, please finalize the financial reports by July 18. Marcus, update the incident-response documentation by July 19.

            Elena: I will contact the finance department today and complete the report by Friday.

            Marcus: I will update the incident-response document and verify the administrative access list with Priya.

            Priya: I can complete the access review by July 19.

            Alex: The main risk is that missing documents could delay the audit. We decided to hold a final readiness review on July 20 at 10 AM.

            End of transcript.
            $audit$
        ),

        (
            'Vendor Review',
            $vendor$
                Meeting: Vendor Review
Date: July 17, 2026

                Participants: Alex, Priya, Sam, and Elena

            Alex: The purpose of this meeting is to review the renewal proposal from our software vendor.

            Priya: The vendor proposed a twelve percent price increase for the next contract period. They also changed the support response time from two hours to four hours.

            Sam: The new response time could affect critical incidents. The current contract allows us to terminate the agreement with thirty days' notice.

Elena: I checked two alternative vendors. Their prices are lower, but migrating our data would require additional work.

Alex: Before making a decision, we need a full cost comparison that includes migration expenses.

Priya: I will prepare the price comparison by July 22.

Sam: I will review the termination and data-export clauses by July 21.

Elena: I will contact the alternative vendors and request details about their migration support by July 22.

Alex: We decided not to approve the renewal today. The main risks are increased costs, slower support, and possible service interruption during migration.

End of transcript.
            $vendor$
        ),

        (
            'Retro Q2',
            $retro$
Meeting: Retro Q2
Date: July 19, 2026

Participants: Elena, Marcus, Priya, and Sam

Elena: Let us review what worked well and what caused problems during the second quarter.

Marcus: Development speed improved, but testing was often started too late. Several issues were discovered immediately before release.

Priya: Requirements also changed during some sprints without being documented. That created confusion about which version should be implemented.

Sam: Communication between development and QA improved, but QA was not always included in sprint planning.

Elena: We should involve QA earlier and document all requirement changes in the project board.

Marcus: I can create a standard checklist for development handoff.

Priya: I will prepare a process for recording requirement changes and assigning approval responsibility.

Sam: I will represent QA during the next sprint-planning meeting.

Elena: We decided that QA must participate in every sprint-planning session. We will evaluate the process during the next retrospective.

End of transcript.
            $retro$
        ),

        (
            'Morning Standup',
            $standup$
Meeting: Morning Standup
Date: July 20, 2026

Topic: Employee Registration Form Review
Participants: Amelia, James, Chloe, and Daniel

Amelia: Today we need to review the problems found in the new employee registration form.

James: During testing, I submitted the form without a phone number, and the employee record was still created.

Chloe: Required validation exists for the name and email fields, but it is missing from the phone number and department fields.

Daniel: The form also accepts start dates from the past, even though new employees should have a future start date.

James: Email validation rejects addresses without an at sign, but it accepts addresses that end immediately after the at sign.

Chloe: I will add the missing phone-number and department validation. I will also improve email validation.

Daniel: I will update the start-date validation and make the error message clearer.

Amelia: Existing form values must remain after a validation error. Users should not need to complete the entire form again.

James: After the fixes are ready, I will test every required field separately and run a valid submission test.

Amelia: We decided that the form cannot be released until all validation tests pass. We will review the results tomorrow afternoon.

End of transcript.
            $standup$
        ),

        (
            '8 AM Client Meeting',
            $clientmtg$
Meeting: 8 AM Client Meeting
Date: July 20, 2026

Participants: Alex, Elena, Sam, and the client team

Alex: The purpose of this meeting is to review the progress of the customer portal and confirm the release priorities.

Client: The account dashboard looks good, but users still cannot download monthly reports in PDF format.

Elena: The report-download functionality is implemented, but we found formatting problems on mobile devices.

Client: Mobile support is important because many managers review reports from their phones.

Sam: We also identified a performance issue. Reports containing more than ten thousand records take over thirty seconds to generate.

Alex: We should fix performance and mobile formatting before enabling the feature in production.

Elena: I will correct the mobile layout by July 23.

Sam: I will investigate report-generation performance and prepare an optimization proposal by July 24.

Client: We also need a short user guide before release.

Alex: I will prepare the user guide and send it for review by July 25.

End of transcript.
            $clientmtg$
        )
) AS seed_transcript(meeting_title, content)
    ON seed_transcript.meeting_title = m.title
ON CONFLICT (meeting_id)
DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = now();


-- Add 5 future meetings for testuser
WITH existing_user AS (
    SELECT id FROM app_user WHERE username = 'testuser'
)
INSERT INTO meeting (id, title, description, meeting_datetime, processing_status, created_at, updated_at, owner_id)
SELECT gen_random_uuid(), title, description, meeting_datetime::timestamp, status, now(), now(), existing_user.id
FROM existing_user, (VALUES
    ('Q3 Kickoff', 'Planning session for Q3 objectives', '2026-08-03 10:00:00', 'NOT_STARTED'),
    ('Client Renewal Call', 'Contract renewal discussion with client', '2026-08-05 14:00:00', 'NOT_STARTED'),
    ('Design Review Round 2', 'Follow-up on UI feedback', '2026-08-07 11:00:00', 'NOT_STARTED'),
    ('Security Audit Prep', 'Preparing documentation for upcoming audit', '2026-08-10 09:30:00', 'NOT_STARTED'),
    ('Team Retro August', 'Monthly team retrospective', '2026-08-14 15:00:00', 'NOT_STARTED')
) AS meetings(title, description, meeting_datetime, status);


-- Add transcripts for 3 of the new meetings
INSERT INTO transcript (id, meeting_id, content, created_at, updated_at)
SELECT
    gen_random_uuid(),
    m.id,
    seed_transcript.content,
    now(),
    now()
FROM meeting m
JOIN (
    VALUES
    (
        'Q3 Kickoff',
        $q3$Meeting: Q3 Kickoff
Date: August 3, 2026

Participants: Alex, Elena, Marcus, and Priya

Alex: Let's set our priorities for Q3. Our biggest focus should be finishing the AI summary feature and stabilizing the meeting attendee sync.

            Elena: I can take ownership of the frontend polish work — cleaning up remaining inline styles and making sure every page pulls from the shared components.

            Marcus: On the backend side, I want to tackle performance. Some of our queries are running way more often than they need to, especially on the meetings list page.

Priya: I'll focus on testing. We need proper coverage on the AI parsing logic before we present this to stakeholders.

Alex: Let's also revisit the prompt templates. They've changed a lot recently and we should document what each version actually does.

Elena: Agreed. I'll create a short doc summarizing the current prompt structure by end of next week.

Marcus: I can profile the slow queries by Friday and report back with findings.

Priya: I'll have a first pass of test cases ready by August 10th.

Alex: Sounds good. We'll check in again in two weeks to review progress.

End of transcript.
$q3$
        ),
        (
            'Client Renewal Call',
            $renewal$Meeting: Client Renewal Call
Date: August 5, 2026

                Participants: Alex, Sam, and the client team

            Alex: Thanks for joining. We wanted to walk through the renewal terms for the next contract period.

            Client: We've been happy with the platform overall, but we'd like to discuss pricing given the upcoming usage increase.

            Sam: We can put together a tiered pricing option that scales with your team size. I'll have a proposal ready by next week.

Client: That would be helpful. We'd also like to request faster support response times as part of the renewal.

            Alex: We can commit to a four-hour response window for critical issues. I'll get that written into the updated agreement.

Sam: I'll coordinate with legal to have the revised contract ready for review by August 12th.

            Client: Great, we should be able to sign shortly after that.

Alex: Perfect. We'll follow up with the documents early next week.

End of transcript.
$renewal$
    ),
    (
        'Design Review Round 2',
        $design$Meeting: Design Review Round 2
Date: August 7, 2026

Participants: Elena, Priya, and Daniel

Elena: Thanks for the feedback on the first round. Let's go through the updated mockups.

Priya: The new color contrast looks much better, especially on the dashboard cards. My only concern is the button spacing on mobile view.

Daniel: I noticed that too. I think we should increase the tap target size for the primary action buttons.

Elena: I'll adjust the spacing and re-export the mobile mockups by Friday.

Priya: Once that's updated, I can run it by a couple of users for quick feedback.

Daniel: I'll also double check the calendar view since that had some alignment issues last time.

Elena: Sounds good. Let's regroup early next week once the updated mockups are ready.

Priya: I'll schedule the user feedback session for August 13th.

End of transcript.
$design$
    )
) AS seed_transcript(meeting_title, content)
    ON seed_transcript.meeting_title = m.title
ON CONFLICT (meeting_id)
DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = now();