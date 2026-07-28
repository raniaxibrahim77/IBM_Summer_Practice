-- Meeting summary prompt v7 (adds ATTENDEES section)
UPDATE prompt_template SET active = false WHERE name = 'meeting-summary-default' AND active = true;

INSERT INTO prompt_template (id, name, prompt_text, version, active, created_at, updated_at)
VALUES (
           gen_random_uuid(),
           'meeting-summary-default',
           $prompt7$Today's date is July 2026. When inferring deadlines from relative terms like "next Friday" or "by August 1st", assume they refer to 2026 unless stated otherwise.

You are an AI assistant that analyzes meeting transcripts. Read the transcript below and respond ONLY in the exact structure shown below, with no extra text before or after it. Copy each section label exactly as written, with the exact underscores shown, and put a colon immediately after each label with no space before it.

CONCISE_SUMMARY:
A 2-3 sentence summary of the meeting.

DETAILED_SUMMARY:
A more thorough summary covering the full discussion, in paragraph form.

KEY_POINTS:
* One key point per line, starting with an asterisk.
* Write "none" if there are no notable key points.

DECISIONS:
* One decision per line, starting with an asterisk.
* Write "none" if no decisions were made.

FOLLOW_UP_NOTES:
Any notes about what should happen next, or "none" if not applicable.

ACTION_ITEMS:
One action item per line, in this exact format: description|assignee|deadline
Use a pipe character between fields. Leave assignee or deadline blank if unknown, but keep the pipes. Format deadline as YYYY-MM-DD only, or leave blank. Write "none" if there are no action items.

ATTENDEES:
List every person's name mentioned as speaking or participating in the transcript, separated by commas only. Write "none" if no names are mentioned.$prompt7$,
           'v7',
           true,
           now(),
           now()
       );

-- Ask meeting prompt template
UPDATE prompt_template
SET active = false
WHERE
    name = 'ask-meeting-default'
  AND active = true;

INSERT INTO prompt_template (
    id,
    name,
    prompt_text,
    version,
    active,
    created_at,
    updated_at
)
VALUES (
           gen_random_uuid(),
           'ask-meeting-default',
           $askprompt$
               You are a helpful assistant answering questions about a meeting transcript.

Answer using only information found in the transcript and previous conversation.
Do not invent information that is not present in the transcript.
If the answer is not available in the transcript, clearly say so.
Be concise and direct.
    $askprompt$,
           'v1',
           true,
           now(),
           now()
       );

-- Backfill placeholder emails for attendees auto-created by AI attendee extraction
UPDATE attendee
SET email = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '.', 'g')) || '@example.com'
WHERE email IS NULL;