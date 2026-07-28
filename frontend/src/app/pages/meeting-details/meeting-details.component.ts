import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MeetingService, MeetingResponse } from '../../services/meeting.service';
import { TranscriptService } from '../../services/transcript.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { AttendeeResponse, AttendeeService } from '../../services/attendee.service';
import { MeetingAiService, AiResultResponse } from '../../services/meeting-ai.service';
import { ActionItemService } from '../../services/action-item.service';

interface Attendee {
  id: string;
  name: string;
  email: string;
  roleInMeeting: string | null;
  initials: string;
  color: string;
}

interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  isUpdating: boolean;
}

interface ChatMessage {
  from: 'assistant' | 'user';
  text: string;
}

const AVATAR_COLORS = ['#75C3D1', '#A33E43', '#8CA888', '#D9A24B'];

type MeetingProcessingStatusLabel =
  | 'Not processed'
  | 'Processing'
  | 'Processed'
  | 'Failed';

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.css',
})
export class MeetingDetailsComponent implements OnInit {
  loading = true;
  notFound = false;

  meetingId = '';
  title = '';
  date = '';
  status: MeetingProcessingStatusLabel = 'Not processed';

  attendees: Attendee[] = [];
  availableAttendees: AttendeeResponse[] = [];
  aiSummary = 'No AI summary is available for this meeting yet.';
  hasAiResult = false;
  actionItems: ActionItem[] = [];
  transcriptText = '';
  
  isUploadingTranscript = false;
  transcriptUploadError = '';

  isGeneratingSummary = false;
  isSendingMessage = false;

  showDeleteMeetingConfirmation = false;
  isDeletingMeeting = false;
  deleteMeetingError = '';

  selectedAttendeeId = '';
  chatInput = '';

  chatMessages: ChatMessage[] = [
    { from: 'assistant', text: "Hi, I've read through this meeting. Want a summary, key risks, or the action items again?" },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private transcriptService: TranscriptService,
    private attendeeService: AttendeeService,
    private meetingAiService: MeetingAiService,
    private actionItemService: ActionItemService,
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

    this.loadAttendees();
    this.loadAvailableAttendees();

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
        this.meetingAiService.getLatestAiResult(id).subscribe({
      next: (result) => {
        this.applyAiResult(result);
        this.cdr.markForCheck();
      },
      error: () => {
      },
    });
  }

  private loadAttendees(): void {
    this.attendeeService
      .getMeetingAttendees(this.meetingId)
      .subscribe({
        next: (attendees) => {
          this.attendees = attendees.map(
            (attendee, index) =>
              this.toAttendeeView(attendee, index)
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to load meeting attendees',
            error
          );

          this.attendees = [];
          this.cdr.markForCheck();
        },
      });
  }

  private loadAvailableAttendees(): void {
    this.attendeeService.getAttendees().subscribe({
      next: (attendees) => {
        this.availableAttendees = attendees;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(
          'Failed to load available attendees',
          error
        );
      },
    });
  }

  private toAttendeeView(
    attendee: AttendeeResponse,
    index: number
  ): Attendee {
    const initials = attendee.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return {
      id: attendee.id,
      name: attendee.name,
      email: attendee.email ?? '',
      roleInMeeting: attendee.roleInMeeting,
      initials,
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    };
  }

  private formatMeetingProcessingStatus(
    status: string
  ): MeetingProcessingStatusLabel {

    switch (status) {
      case 'DONE':
      case 'COMPLETED':
        return 'Processed';

      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'Processing';

      case 'FAILED':
        return 'Failed';

      case 'NOT_STARTED':
      case 'NOT_PROCESSED':
      default:
        return 'Not processed';
    }
  }

  private applyMeeting(m: MeetingResponse): void {
    this.title = m.title;
    const d = new Date(m.meetingDatetime);
    this.date = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    this.status = this.formatMeetingProcessingStatus(
      m.processingStatus
    );
  }

  private applyAiResult(result: AiResultResponse): void {
    this.hasAiResult = true;
    this.aiSummary =
      result.conciseSummary ??
      result.detailedSummary ??
      'The AI response did not contain a summary.';

    this.actionItems = (result.actionItems ?? []).map((item) => ({
      id: item.id,
      text: item.description,
      done: item.status === 'DONE' || item.status === 'COMPLETED',
      isUpdating: false,
    }));
  }

  private getAiErrorMessage(
    error: any,
    fallback: string
  ): string {
    if (error.status === 404) {
      return 'This meeting does not have a transcript yet.';
    }

    if (error.status === 503) {
      return 'The AI service is unavailable. Make sure Ollama is running.';
    }

    if (error.status === 0) {
      return 'The backend could not be reached.';
    }

    return fallback;
  }

  get statusClasses(): string {
    switch (this.status) {
      case 'Processed':
        return 'status-processed';

      case 'Processing':
        return 'status-processing';

      case 'Failed':
        return 'status-failed';

      default:
        return 'status-not-processed';
    }
  }

  get completedActionCount(): number {
    return this.actionItems.filter((a) => a.done).length;
  }

  get unassignedAttendees(): AttendeeResponse[] {
    return this.availableAttendees.filter(
      (candidate) =>
        candidate.email &&
        !this.attendees.some(
          (assigned) => assigned.id === candidate.id
        )
    );
  }

  toggleActionItem(item: ActionItem): void {
    if (item.isUpdating) {
      return;
    }

    const previousValue = item.done;
    const nextValue = !previousValue;
    const nextStatus = nextValue ? 'DONE' : 'OPEN';

    item.done = nextValue;
    item.isUpdating = true;

    this.actionItemService
      .updateStatus(item.id, nextStatus)
      .subscribe({
        next: (updatedItem) => {
          item.done =
            updatedItem.status === 'DONE' ||
            updatedItem.status === 'COMPLETED';

          item.isUpdating = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to update action item status',
            error
          );

          // go back to previous value if request fails
          item.done = previousValue;
          item.isUpdating = false;

          alert('The action item status could not be updated.');
          this.cdr.markForCheck();
        },
      });
  }

  removeAttendee(attendee: Attendee): void {
    this.attendeeService
      .removeMeetingAttendee(
        this.meetingId,
        attendee.id
      )
      .subscribe({
        next: () => {
          this.attendees = this.attendees.filter(
            (item) => item.id !== attendee.id
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to remove attendee from meeting',
            error
          );
          alert('Failed to remove attendee from the meeting.');
        },
      });
  }

  addAttendee(): void {
    if (!this.selectedAttendeeId) {
      return;
    }

    const attendee = this.availableAttendees.find(
      (item) => item.id === this.selectedAttendeeId
    );

    if (!attendee) {
      alert('The selected attendee could not be found.');
      return;
    }

    this.attendeeService
      .addMeetingAttendee(this.meetingId, {
        attendeeId: attendee.id,
        roleInMeeting: null,
      })
      .subscribe({
        next: (addedAttendee) => {
          this.attendees.push(
            this.toAttendeeView(
              addedAttendee,
              this.attendees.length
            )
          );

          this.selectedAttendeeId = '';
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to add attendee to meeting',
            error
          );
          alert('Failed to add attendee to the meeting.');
        },
      });
  }

  regenerateSummary(): void {
    if (
      !this.meetingId ||
      !this.transcriptText ||
      this.isGeneratingSummary
    ) {
      return;
    }

    this.isGeneratingSummary = true;
    this.status = 'Processing';

    this.meetingAiService
      .generateAiResult(this.meetingId)
      .subscribe({
        next: (result) => {
          this.applyAiResult(result);
          this.loadAttendees();
          this.status = 'Processed';
          this.isGeneratingSummary = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to generate AI result',
            error
          );

          this.status = 'Failed';
          this.isGeneratingSummary = false;

          this.chatMessages.push({
            from: 'assistant',
            text: this.getAiErrorMessage(
              error,
              'The AI summary could not be generated.'
            ),
          });

          this.cdr.markForCheck();
        },
      });
  }

  onTranscriptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file || this.isUploadingTranscript) {
      return;
    }

    this.transcriptUploadError = '';

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.transcriptUploadError =
        'Please select a .txt file.';
      input.value = '';
      return;
    }

    this.isUploadingTranscript = true;

    file
      .text()
      .then((content) => {
        if (!content.trim()) {
          this.isUploadingTranscript = false;
          this.transcriptUploadError =
            'The transcript file is empty.';
          this.cdr.markForCheck();
          return;
        }

        this.transcriptService
          .createTranscript(this.meetingId, content)
          .subscribe({
            next: () => {
              this.transcriptText = content;
              this.isUploadingTranscript = false;
              this.transcriptUploadError = '';
              input.value = '';
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error(
                'Failed to upload transcript',
                error
              );

              this.isUploadingTranscript = false;
              this.transcriptUploadError =
                error.error?.message ||
                'The transcript could not be uploaded.';

              input.value = '';
              this.cdr.markForCheck();
            }
          });
      })
      .catch((error) => {
        console.error(
          'Failed to read transcript file',
          error
        );

        this.isUploadingTranscript = false;
        this.transcriptUploadError =
          'The transcript file could not be read.';

        input.value = '';
        this.cdr.markForCheck();
      });
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

  exportSummary(): void {
    if (!this.hasAiResult || !this.aiSummary.trim()) {
      return;
    }

    const actionItemLines =
      this.actionItems.length > 0
        ? this.actionItems.map((item) => {
            const checkbox = item.done ? '[x]' : '[ ]';
            return `${checkbox} ${item.text}`;
          })
        : ['No action items were generated.'];

    const content = [
      this.title,
      '='.repeat(this.title.length),
      '',
      `Date: ${this.date}`,
      `Status: ${this.status}`,
      '',
      'AI SUMMARY',
      '----------',
      '',
      this.aiSummary.trim(),
      '',
      'ACTION ITEMS',
      '------------',
      '',
      ...actionItemLines,
      '',
      `Completed: ${this.completedActionCount}/${this.actionItems.length}`,
      '',
    ].join('\n');

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download =
      `${this.toSafeFileName(this.title)}_summary.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  private toSafeFileName(value: string): string {
    const safeName = value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^\.+|\.+$/g, '');

    return safeName || 'meeting';
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

    if (
      !content ||
      !this.meetingId ||
      this.isSendingMessage
    ) {
      return;
    }

    const previousMessages = this.chatMessages.map(
      (message) => ({
        role: message.from,
        text: message.text,
      })
    );

    this.chatMessages.push({
      from: 'user',
      text: content,
    });

    this.chatInput = '';
    this.isSendingMessage = true;
    this.cdr.markForCheck();

    this.meetingAiService
      .askMeeting(this.meetingId, {
        question: content,
        previousMessages,
      })
      .subscribe({
        next: (response) => {
          this.chatMessages.push({
            from: 'assistant',
            text:
              response.answer ||
              'The AI service returned an empty answer.',
          });

          this.isSendingMessage = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to ask meeting AI',
            error
          );

          this.chatMessages.push({
            from: 'assistant',
            text: this.getAiErrorMessage(
              error,
              'Your question could not be answered.'
            ),
          });

          this.isSendingMessage = false;
          this.cdr.markForCheck();
        },
      });
  }

  openDeleteMeetingConfirmation(): void {
    this.deleteMeetingError = '';
    this.showDeleteMeetingConfirmation = true;
  }

  closeDeleteMeetingConfirmation(): void {
    if (this.isDeletingMeeting) {
      return;
    }

    this.showDeleteMeetingConfirmation = false;
    this.deleteMeetingError = '';
  }

  confirmDeleteMeeting(): void {
    if (
      !this.meetingId ||
      this.isDeletingMeeting
    ) {
      return;
    }

    this.isDeletingMeeting = true;
    this.deleteMeetingError = '';

    this.meetingService
      .deleteMeeting(this.meetingId)
      .subscribe({
        next: () => {
          this.isDeletingMeeting = false;
          this.showDeleteMeetingConfirmation = false;

          this.router.navigate(['/meetings']);
        },
        error: (error) => {
          console.error(
            'Failed to delete meeting',
            error
          );

          this.isDeletingMeeting = false;
          this.deleteMeetingError =
            error.error?.message ||
            'The meeting could not be deleted. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }
}