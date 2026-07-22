import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MeetingService, MeetingResponse } from '../../services/meeting.service';
import { TranscriptService } from '../../services/transcript.service';

interface Attendee {
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface ActionItem {
  id: string;
  text: string;
  done: boolean;
}

interface ChatMessage {
  from: 'assistant' | 'user';
  text: string;
}

const AVATAR_COLORS = ['#75C3D1', '#A33E43', '#8CA888', '#D9A24B'];

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.css',
})
export class MeetingDetailsComponent implements OnInit {
  loading = true;
  notFound = false;

  meetingId = '';
  title = '';
  date = '';
  status: 'Completed' | 'Processing' | 'Draft' = 'Draft';

  attendees: Attendee[] = [];
  aiSummary = 'No AI summary is available for this meeting yet.';
  actionItems: ActionItem[] = [];
  transcriptText = '';

  newAttendeeEmail = '';
  chatInput = '';

  chatMessages: ChatMessage[] = [
    { from: 'assistant', text: "Hi, I've read through this meeting. Want a summary, key risks, or the action items again?" },
  ];

  constructor(
    private route: ActivatedRoute,
    private meetingService: MeetingService,
    private transcriptService: TranscriptService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.notFound = true;
        this.loading = false;
        this.cdr.markForCheck();
        return;
      }
      this.loadMeeting(id);
    });
  }

  private loadMeeting(id: string): void {
    this.loading = true;
    this.notFound = false;
    this.meetingId = id;

    this.meetingService.getMeeting(id).subscribe({
      next: (m) => {
        this.applyMeeting(m);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load meeting', err);
        this.notFound = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
      this.transcriptService.getTranscript(id).subscribe({
        next: (t) => {
          this.transcriptText = t.content;
          this.cdr.markForCheck();
        },
        error: () => {
          this.transcriptText = ''; // no transcript yet — expected, not a real error
        },
    });
  }


  private applyMeeting(m: MeetingResponse): void {
    this.title = m.title;
    const d = new Date(m.meetingDatetime);
    this.date = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    this.status = m.processingStatus === 'DONE' ? 'Completed'
      : m.processingStatus === 'PROCESSING' ? 'Processing'
      : 'Draft';

    // TODO: attendees, AI summary, and action items need their own endpoints
    // (GET /api/meetings/{id}/attendees, GET /api/meetings/{id}/ai-result)
    // once those exist on the backend — for now they stay empty/placeholder.
    this.attendees = [];
    this.aiSummary = 'No AI summary is available for this meeting yet.';
    this.actionItems = [];
  }

  get statusClasses(): string {
    switch (this.status) {
      case 'Completed':
        return 'bg-[#8CA888] text-white';
      case 'Processing':
        return 'bg-[#75C3D1] text-[#450C21]';
      default:
        return 'bg-[#450C21]/10 text-[#450C21]';
    }
  }

  get completedActionCount(): number {
    return this.actionItems.filter((a) => a.done).length;
  }

  toggleActionItem(item: ActionItem): void {
    item.done = !item.done;
  }

  removeAttendee(attendee: Attendee): void {
    this.attendees = this.attendees.filter((a) => a !== attendee);
  }

  addAttendee(): void {
    const email = this.newAttendeeEmail.trim();
    if (!email) {
      return;
    }
    const namePart = email.split('@')[0] || 'New attendee';
    const initials = namePart.slice(0, 2).toUpperCase();
    this.attendees.push({
      name: namePart,
      email,
      initials,
      color: AVATAR_COLORS[this.attendees.length % AVATAR_COLORS.length],
    });
    this.newAttendeeEmail = '';
  }

  regenerateSummary(): void {
    // TODO: wire to POST /api/meetings/{id}/process once AiResultController exists.
    this.chatMessages.push({ from: 'assistant', text: 'Regenerating the summary from the latest transcript…' });
  }

  downloadTranscript(): void {
    if (!this.transcriptText) {
      return;
    }
    const blob = new Blob([this.transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.title.replace(/\s+/g, '_')}_transcript.txt`;
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
    this.chatMessages.push({
      from: 'assistant',
      text: 'This is a placeholder reply — connect this to the AIResult service to answer from the real transcript.',
    });
  }
}