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

Decisions:
- All audit documents must be completed before July 20.
- A final readiness review will be held on July 20.

Action items:
- Elena will finalize the financial reports by July 18.
- Marcus will update the incident-response documentation by July 19.
- Priya will verify the administrative access list by July 19.

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

Decisions:
- The renewal will not be approved until the comparison is complete.
- Legal and migration risks must be reviewed first.

Action items:
- Priya will prepare the vendor price comparison by July 22.
- Sam will review the contract clauses by July 21.
- Elena will request migration information by July 22.

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

Decisions:
- QA will participate in sprint planning.
- Requirement changes must be documented and approved.
- Every development handoff will use a checklist.

Action items:
- Marcus will prepare the handoff checklist by July 23.
- Priya will document the requirement-change process by July 24.
- Sam will attend the next sprint-planning meeting.

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

Decisions:
- The form will not be released until validation is fixed.
- Existing form data must remain after validation errors.

Action items:
- Chloe will fix required-field and email validation by July 21.
- Daniel will update start-date validation by July 21.
- James will run the final tests by July 22.

End of transcript.
            $standup$
        ),

        (
            '8 AM Client Meeting',
            $client$
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

Decisions:
- PDF reports will not be released until mobile and performance issues are resolved.
- The client will review the user guide before production release.

Action items:
- Elena will fix mobile report formatting by July 23.
- Sam will investigate report performance by July 24.
- Alex will prepare the user guide by July 25.

End of transcript.
            $client$
        )
) AS seed_transcript(meeting_title, content)
    ON seed_transcript.meeting_title = m.title
ON CONFLICT (meeting_id)
DO UPDATE SET
    content = EXCLUDED.content,
    updated_at = now();