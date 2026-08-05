import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AttendeeResponse, AttendeeService } from '../../../../services/attendee.service';
import { AuthService } from '../../../../services/auth.service';
import { MeetingAiService } from '../../../../services/meeting-ai.service';
import {
  MeetingCreateRequest,
  MeetingResponse,
  MeetingService,
} from '../../../../services/meeting.service';
import { TranscriptService } from '../../../../services/transcript.service';

@Component({
  selector: 'app-log-meeting-modal',
  imports: [FormsModule],
  templateUrl: './log-meeting-modal.html',
  styleUrl: './log-meeting-modal.css',
})
export class LogMeetingModal implements OnInit {
  @Output() cancelled = new EventEmitter<void>();
  @Output() meetingLogged = new EventEmitter<MeetingResponse>();

  newMeetingName = '';
  newMeetingDate = '';
  newMeetingTime = '';
  peopleSearch = '';
  processWithAI = true;

  isLoggingMeeting = false;
  logMeetingError = '';

  transcriptFile: File | null = null;
  transcriptError: string | null = null;

  availableAttendees: AttendeeResponse[] = [];
  invitedPeople: AttendeeResponse[] = [];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private transcriptService: TranscriptService,
    private attendeeService: AttendeeService,
    private meetingAiService: MeetingAiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAvailableAttendees();
  }

  get peopleSuggestions(): AttendeeResponse[] {
    const term = this.peopleSearch.trim().toLowerCase();

    if (!term) {
      return [];
    }

    return this.availableAttendees
      .filter((attendee) => {
        const matchesSearch =
          attendee.name.toLowerCase().includes(term) ||
          (attendee.email?.toLowerCase().includes(term) ?? false);

        const alreadyInvited = this.invitedPeople.some(
          (invited) => invited.id === attendee.id,
        );

        return matchesSearch && !alreadyInvited;
      })
      .slice(0, 5);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  addPerson(attendee: AttendeeResponse): void {
    const alreadyInvited = this.invitedPeople.some(
      (invited) => invited.id === attendee.id,
    );

    if (!alreadyInvited) {
      this.invitedPeople = [...this.invitedPeople, attendee];
    }

    this.peopleSearch = '';
  }

  removePerson(attendeeId: string): void {
    this.invitedPeople = this.invitedPeople.filter(
      (attendee) => attendee.id !== attendeeId,
    );
  }

  onTranscriptFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.transcriptFile = null;
      return;
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.transcriptError = 'Please upload a .txt file.';
      this.transcriptFile = null;
      input.value = '';
      return;
    }

    this.transcriptError = null;
    this.transcriptFile = file;
  }

  removeTranscriptFile(): void {
    this.transcriptFile = null;
  }

  logMeeting(): void {
    this.logMeetingError = '';
    this.transcriptError = null;

    const title = this.newMeetingName.trim();

    if (!title) {
      this.logMeetingError = 'Please enter a meeting name.';
      return;
    }

    if (!this.newMeetingDate) {
      this.logMeetingError = 'Please select the meeting date.';
      return;
    }

    if (!this.newMeetingTime) {
      this.logMeetingError = 'Please select the meeting time.';
      return;
    }

    const meetingDateTime = new Date(
      `${this.newMeetingDate}T${this.newMeetingTime}:00`,
    );

    if (Number.isNaN(meetingDateTime.getTime())) {
      this.logMeetingError = 'The meeting date is invalid.';
      return;
    }

    if (meetingDateTime.getTime() > Date.now()) {
      this.logMeetingError = 'A logged meeting must be in the past.';
      return;
    }

    if (!this.transcriptFile) {
      this.transcriptError = 'A transcript file is required.';
      return;
    }

    if (this.isLoggingMeeting) {
      return;
    }

    this.isLoggingMeeting = true;

    this.transcriptFile
      .text()
      .then((content) => {
        if (!content.trim()) {
          this.isLoggingMeeting = false;
          this.transcriptError = 'The transcript file is empty.';
          this.cdr.markForCheck();
          return;
        }

        const request: MeetingCreateRequest = {
          title,
          description: '',
          meetingDatetime: `${this.newMeetingDate}T${this.newMeetingTime}:00`,
          ownerId: this.authService.getCurrentUser()?.id ?? null,
          attendeeIds: this.invitedPeople.map((attendee) => attendee.id),
        };

        this.meetingService.createMeeting(request).subscribe({
          next: (createdMeeting) => {
            this.saveTranscript(createdMeeting, content);
          },
          error: (error) => {
            console.error('Failed to log meeting', error);

            this.isLoggingMeeting = false;
            this.logMeetingError =
              error.error?.message || 'The meeting could not be logged.';

            this.cdr.markForCheck();
          },
        });
      })
      .catch((error) => {
        console.error('Failed to read transcript', error);

        this.isLoggingMeeting = false;
        this.transcriptError = 'The transcript file could not be read.';
        this.cdr.markForCheck();
      });
  }

  private loadAvailableAttendees(): void {
    this.attendeeService.getAttendees().subscribe({
      next: (attendees) => {
        this.availableAttendees = attendees;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load attendees', error);
      },
    });
  }

  private saveTranscript(
    createdMeeting: MeetingResponse,
    content: string,
  ): void {
    this.transcriptService
      .createTranscript(createdMeeting.id, content)
      .subscribe({
        next: () => {
          if (!this.processWithAI) {
            this.finishLogging(createdMeeting);
            return;
          }

          this.processMeetingWithAI(createdMeeting);
        },
        error: (error) => {
          console.error('Failed to save transcript', error);

          this.isLoggingMeeting = false;
          this.logMeetingError =
            'The meeting was created, but the transcript could not be saved.';

          this.cdr.markForCheck();
        },
      });
  }

  private processMeetingWithAI(createdMeeting: MeetingResponse): void {
    this.meetingAiService.generateAiResult(createdMeeting.id).subscribe({
      next: () => {
        this.finishLogging(createdMeeting);
      },
      error: (error) => {
        console.error(
          'Meeting was logged, but AI processing failed',
          error,
        );

        alert(
          'The meeting and transcript were saved, but the AI summary could not be generated.',
        );

        this.finishLogging(createdMeeting);
      },
    });
  }

  private finishLogging(createdMeeting: MeetingResponse): void {
    this.isLoggingMeeting = false;
    this.cdr.markForCheck();
    this.meetingLogged.emit(createdMeeting);
  }
}