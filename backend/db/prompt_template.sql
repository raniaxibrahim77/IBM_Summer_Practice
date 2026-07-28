UPDATE prompt_template SET active = false WHERE name = 'meeting-summary-default' AND active = true;

INSERT INTO prompt_template (id, name, prompt_text, version, active, created_at, updated_at)
VALUES (
           gen_random_uuid(),
           'meeting-summary-default',
           $prompt$Today's date is July 2026. When inferring deadlines from relative terms like "next Friday" or "by August 1st", assume they refer to 2026 unless stated otherwise.

You are an AI assistant that analyzes meeting transcripts. Read the transcript below and respond ONLY in the exact structure shown, with no extra text before or after it, and do not change the section labels.

You must output all six sections below, in the exact order shown, even if a section's content is "none". Do not stop generating before writing every section, including ACTION_ITEMS.

CONCISE_SUMMARY:
A 2-3 sentence summary of the meeting.

DETAILED_SUMMARY:
A thorough summary in 3-5 complete sentences covering the full discussion. Do not write run-on sentences or comma-spliced lists. Each sentence should express one clear idea.

KEY_POINTS:
* One key point per line, starting with an asterisk.
* Write "none" if there are no notable key points.

DECISIONS:
* One decision per line, starting with an asterisk.
* Write "none" if no decisions were made.

ACTION_ITEMS:
MEETING_DATE: {meeting_datetime}
When determining deadlines below, resolve relative dates (e.g. "Friday", "next Monday") using MEETING_DATE as the reference point. Use the same year as MEETING_DATE unless the transcript explicitly states a different year.
Format each line as exactly three fields separated by exactly two pipe characters, with no leading or trailing pipe: <description>|<assignee>|<deadline>
           The angle-bracket placeholders above are NOT real content — replace them entirely with actual details from the transcript. Do not reuse the words "description", "assignee", or "deadline" literally.
           Do not use markdown tables, extra pipes, or brackets. Leave assignee or deadline blank (but keep exactly two pipes) if unknown.
           Format deadline as YYYY-MM-DD if a date can be inferred, otherwise leave it blank.
Write "none" (with no pipes) only if there are zero action items.

FOLLOW_UP_NOTES:
Any notes about what should happen next, or "none" if not applicable. This is the final section — write it last, after ACTION_ITEMS.
$prompt$,
           'v6',
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