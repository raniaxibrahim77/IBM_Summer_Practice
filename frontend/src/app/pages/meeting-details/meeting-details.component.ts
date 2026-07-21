import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

type MeetingStatus = 'Completed' | 'Processing' | 'Draft';

interface TranscriptLine {
  time: string;
  speaker: string;
  text: string
}

interface Attendee {
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface ActionItem {
  id: number;
  text: string;
  done: boolean;
}

interface ChatMessage {
  from: 'assistant' | 'user';
  text: string;
}

interface MeetingDetail {
  id: number;
  title: string;
  date: string;
  status: MeetingStatus;
  transcript: TranscriptLine[];
  attendees: Attendee[];
  aiSummary: string;
  actionItems: ActionItem[];
}

// Same accent rotation used for attendee avatars, echoing the header's blue avatar chip.
const AVATAR_COLORS = ['#75C3D1', '#A33E43', '#8CA888', '#D9A24B'];

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.css',
})
export class MeetingDetailsComponent {
  meeting!: MeetingDetail;

  transcriptSearch = '';
  newAttendeeEmail = '';
  chatInput = '';

  chatMessages: ChatMessage[] = [
    { from: 'assistant', text: "Hi, I've read through this meeting. Want a summary, key risks, or the action items again?" },
  ];

  private readonly mockMeetings: MeetingDetail[] = [
    {
      id: 1,
      title: 'Product Launch Meeting',
      date: 'Jul 12, 2026 · 10:00 AM',
      status: 'Completed',
      transcript: [
        { time: '00:45', speaker: 'Elena Chen', text: 'Welcome everyone. Today we\'re finalizing the Q3 roadmap. Let\'s start with the AI feature priorities.' },
        { time: '02:45', speaker: 'Elena Chen', text: 'The sentiment analysis module is 80% ready. We need to decide if we\'re launching real-time translation concurrently or in Q4.' },
        { time: '05:12', speaker: 'Marcus Thorne', text: 'I\'d push translation to Q4. We should focus on stability of core transcription first — enterprise clients are asking for better multi-speaker detection.' },
        { time: '08:20', speaker: 'Alex Rivers', text: 'Agreed. Let\'s mark translation for the October kickoff. Now, about the mobile app overhaul...' },
      ],
      attendees: [
        { name: 'Alex Rivers', email: 'a.rivers@enterprise.com', initials: 'AR', color: AVATAR_COLORS[0] },
        { name: 'Elena Chen', email: 'e.chen@enterprise.com', initials: 'EC', color: AVATAR_COLORS[1] },
        { name: 'Marcus Thorne', email: 'm.thorne@enterprise.com', initials: 'MT', color: AVATAR_COLORS[2] },
      ],
      aiSummary: 'The team prioritized AI features for the Q3 roadmap, focusing on sentiment analysis stability and multi-speaker detection, and deferred real-time translation to Q4 (October) to protect core platform reliability.',
      actionItems: [
        { id: 1, text: 'Refine speaker detection logic', done: false },
        { id: 2, text: 'Schedule Q4 kickoff for translation feature', done: false },
        { id: 3, text: 'Finalize sentiment API documentation', done: true },
        { id: 4, text: 'Share mobile app overhaul brief with design', done: false },
      ],
    },
  ];

  private readonly fallbackMeeting: MeetingDetail = {
    id: 0,
    title: 'Meeting not found',
    date: '—',
    status: 'Draft',
    transcript: [],
    attendees: [],
    aiSummary: 'No AI summary is available for this meeting yet.',
    actionItems: [],
  };

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.meeting = this.mockMeetings.find((m) => m.id === id) ?? this.mockMeetings[0] ?? this.fallbackMeeting;
  }

  get filteredTranscript(): TranscriptLine[] {
    const term = this.transcriptSearch.trim().toLowerCase();
    if (!term) {
      return this.meeting.transcript;
    }
    return this.meeting.transcript.filter(
      (line) => line.text.toLowerCase().includes(term) || line.speaker.toLowerCase().includes(term)
    );
  }

  get statusClasses(): string {
    switch (this.meeting.status) {
      case 'Completed':
        return 'bg-[#8CA888] text-white';
      case 'Processing':
        return 'bg-[#75C3D1] text-[#450C21]';
      default:
        return 'bg-[#450C21]/10 text-[#450C21]';
    }
  }

  get completedActionCount(): number {
    return this.meeting.actionItems.filter((a) => a.done).length;
  }

  toggleActionItem(item: ActionItem): void {
    item.done = !item.done;
  }

  removeAttendee(attendee: Attendee): void {
    this.meeting.attendees = this.meeting.attendees.filter((a) => a !== attendee);
  }

  addAttendee(): void {
    const email = this.newAttendeeEmail.trim();
    if (!email) {
      return;
    }
    const namePart = email.split('@')[0] || 'New attendee';
    const initials = namePart.slice(0, 2).toUpperCase();
    this.meeting.attendees.push({
      name: namePart,
      email,
      initials,
      color: AVATAR_COLORS[this.meeting.attendees.length % AVATAR_COLORS.length],
    });
    this.newAttendeeEmail = '';
  }

  regenerateSummary(): void {
    // Placeholder for wiring to the async AIResult processing endpoint.
    this.chatMessages.push({ from: 'assistant', text: 'Regenerating the summary from the latest transcript…' });
  }

  downloadTranscript(): void {
  if (this.meeting.transcript.length === 0) {
    return;
  }
  const content = this.meeting.transcript
    .map((line) => `[${line.time}] ${line.speaker}: ${line.text}`)
    .join('\n\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${this.meeting.title.replace(/\s+/g, '_')}_transcript.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

  runQuickAction(action: 'summarize' | 'risks' | 'followup'): void {
    const prompts: Record<typeof action, string> = {
      summarize: 'Summarize this meeting',
      risks: 'What are the key risks?',
      followup: 'Draft follow-up notes',
    };
    this.sendMessage(prompts[action]);
  }

  sendMessage(text?: string): void {
    const content = (text ?? this.chatInput).trim();
    if (!content) {
      return;
    }
    this.chatMessages.push({ from: 'user', text: content });
    this.chatInput = '';
    // Placeholder response — replace with a real call to the LLM service layer.
    this.chatMessages.push({
      from: 'assistant',
      text: 'This is a placeholder reply — connect this to the AIResult service to answer from the real transcript.',
    });
  }
}