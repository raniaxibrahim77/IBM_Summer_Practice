import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingCreateRequest, MeetingResponse, MeetingService } from '../../services/meeting.service';
import { MeetingAiService } from '../../services/meeting-ai.service';
import { TranscriptService } from '../../services/transcript.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { AttendeeResponse, AttendeeService } from '../../services/attendee.service';

interface MeetingRow {
  id: string;
  title: string;
  dateTime: string;
  attendees: number;
  hasTranscript: boolean;
}

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css',
})
export class MeetingsComponent implements OnInit {
  searchTerm = '';
  pageSize = 5;
  readonly pageSizeOptions = [5, 10, 20];
  currentPage = 1;

  meetings: MeetingRow[] = [];

  meetingPendingTranscriptDelete: MeetingRow | null = null;
  isDeletingTranscript = false;
  deleteTranscriptError = '';

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private transcriptService: TranscriptService,
    private attendeeService: AttendeeService,
    private meetingAiService: MeetingAiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.meetingService.getMeetings(this.authService.getCurrentUser()?.id).subscribe({
      next: (meetings) => {
        this.meetings = meetings.map((meeting) => this.toMeetingRow(meeting));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load meetings', err),
    });
  }

  private toMeetingRow(m: MeetingResponse): MeetingRow {
    const d = new Date(m.meetingDatetime);
    const dateTime = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      return {
      id: m.id,
      title: m.title,
      dateTime,
      attendees: m.attendeeCount,
      hasTranscript: m.hasTranscript,
    };
  }

  get filteredMeetings(): MeetingRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.meetings;
    }
    return this.meetings.filter((m) => m.title.toLowerCase().includes(term));
  }


get totalPages(): number {
  return Math.max(1, Math.ceil(this.filteredMeetings.length / this.pageSize));
}

get pagedMeetings(): MeetingRow[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredMeetings.slice(start, start + this.pageSize);
}

onSearchChange(): void {
  this.currentPage = 1;
}

onPageSizeChange(): void {
  this.currentPage = 1;
}

goToPage(page: number): void {
  if (page < 1 || page > this.totalPages) {
    return;
  }
  this.currentPage = page;
}

previousPage(): void {
  this.goToPage(this.currentPage - 1);
}

nextPage(): void {
  this.goToPage(this.currentPage + 1);
}

  onRowTranscriptSelected(event: Event, meeting: MeetingRow): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }

    const isValidType = file.name.toLowerCase().endsWith('.txt');
    if (!isValidType) {
      alert('Please upload a .txt file.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
  reader.onload = () => {
    const content = reader.result as string;

    this.transcriptService.createTranscript(meeting.id, content).subscribe({
      next: () => {
        meeting.hasTranscript = true;
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error.status !== 409) {
          console.error('Failed to create transcript', error);
          alert('Failed to upload transcript.');
          return;
        }

        // A transcript already exists for this meeting, so replace its content.
        this.transcriptService
          .updateTranscript(meeting.id, content)
          .subscribe({
            next: () => {
              meeting.hasTranscript = true;
              this.cdr.markForCheck();
            },
            error: (updateError) => {
              console.error(
                'Failed to update transcript',
                updateError
              );
              alert('Failed to update transcript.');
            },
          });
      },
    });
  };
  reader.readAsText(file);
  input.value = '';
}

openDeleteTranscriptConfirmation(
  meeting: MeetingRow,
  event: Event
): void {
  event.preventDefault();
  event.stopPropagation();

  this.meetingPendingTranscriptDelete = meeting;
  this.deleteTranscriptError = '';
}

closeDeleteTranscriptConfirmation(): void {
  if (this.isDeletingTranscript) {
    return;
  }

  this.meetingPendingTranscriptDelete = null;
  this.deleteTranscriptError = '';
}

confirmDeleteTranscript(): void {
  const meeting = this.meetingPendingTranscriptDelete;

  if (!meeting || this.isDeletingTranscript) {
    return;
  }

  this.isDeletingTranscript = true;
  this.deleteTranscriptError = '';

  this.transcriptService
    .deleteTranscript(meeting.id)
    .subscribe({
      next: () => {
        meeting.hasTranscript = false;
        this.isDeletingTranscript = false;
        this.meetingPendingTranscriptDelete = null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error(
          'Failed to delete transcript',
          error
        );

        this.isDeletingTranscript = false;
        this.deleteTranscriptError =
          error.error?.message ||
          'The transcript could not be deleted. Please try again.';

        this.cdr.markForCheck();
      }
    });
}

  // Meeting modal state
  showCreateModal = false;

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

  get peopleSuggestions(): AttendeeResponse[] {
    const term =
      this.peopleSearch.trim().toLowerCase();

    if (!term) {
      return [];
    }

    return this.availableAttendees
      .filter((attendee) => {
        const matchesSearch =
          attendee.name
            .toLowerCase()
            .includes(term) ||
          (
            attendee.email
              ?.toLowerCase()
              .includes(term) ?? false
          );

        const alreadyInvited =
          this.invitedPeople.some(
            (invited) =>
              invited.id === attendee.id
          );

        return (
          matchesSearch &&
          !alreadyInvited
        );
      })
      .slice(0, 5);
  }

  private loadAvailableAttendees(): void {
    this.attendeeService
      .getAttendees()
      .subscribe({
        next: (attendees) => {
          this.availableAttendees =
            attendees;

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to load attendees',
            error
          );
        }
      });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.loadAvailableAttendees();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newMeetingName = '';
    this.newMeetingDate = '';
    this.newMeetingTime = '';
    this.peopleSearch = '';
    this.invitedPeople = [];
    this.processWithAI = true;
    this.transcriptFile = null;
    this.transcriptError = null;
    this.isLoggingMeeting = false;
    this.logMeetingError = '';
  }

  addPerson(
    attendee: AttendeeResponse
  ): void {
    const alreadyInvited =
      this.invitedPeople.some(
        (invited) =>
          invited.id === attendee.id
      );

    if (!alreadyInvited) {
      this.invitedPeople.push(attendee);
    }

    this.peopleSearch = '';
  }

  removePerson(
    attendeeId: string
  ): void {
    this.invitedPeople =
      this.invitedPeople.filter(
        (attendee) =>
          attendee.id !== attendeeId
      );
  }

  onTranscriptFileSelected(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0] ?? null;

    if (!file) {
      this.transcriptFile = null;
      return;
    }

    const isTextFile =
      file.name
        .toLowerCase()
        .endsWith('.txt');

    if (!isTextFile) {
      this.transcriptError =
        'Please upload a .txt file.';

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

    const title =
      this.newMeetingName.trim();

    if (!title) {
      this.logMeetingError =
        'Please enter a meeting name.';
      return;
    }

    if (!this.newMeetingDate) {
      this.logMeetingError =
        'Please select the meeting date.';
      return;
    }

    if (!this.newMeetingTime) {
      this.logMeetingError =
        'Please select the meeting time.';
      return;
    }

    const meetingDateTime = new Date(
      `${this.newMeetingDate}T${this.newMeetingTime}:00`
    );

    if (
      Number.isNaN(meetingDateTime.getTime())
    ) {
      this.logMeetingError =
        'The meeting date is invalid.';
      return;
    }

    if (
      meetingDateTime.getTime() >
      Date.now()
    ) {
      this.logMeetingError =
        'A logged meeting must be in the past.';
      return;
    }

    if (!this.transcriptFile) {
      this.transcriptError =
        'A transcript file is required.';
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
          this.transcriptError =
            'The transcript file is empty.';
          this.cdr.markForCheck();
          return;
        }

        const request: MeetingCreateRequest = {
          title,
          description: '',
          meetingDatetime:
            `${this.newMeetingDate}T${this.newMeetingTime}:00`,
          ownerId:
            this.authService.getCurrentUser()?.id ??
            null,
          attendeeIds:
            this.invitedPeople.map(
              (attendee) => attendee.id
            )
        };

        this.meetingService
          .createMeeting(request)
          .subscribe({
            next: (createdMeeting) => {
              this.transcriptService
                .createTranscript(
                  createdMeeting.id,
                  content
                )
                .subscribe({
                  next: () => {
                    const newRow =
                      this.toMeetingRow(createdMeeting);

                    newRow.hasTranscript = true;

                    this.meetings = [
                      newRow,
                      ...this.meetings
                    ];

                    const finishLogging = (): void => {
                      this.closeCreateModal();
                      this.cdr.markForCheck();
                    };

                    if (!this.processWithAI) {
                      finishLogging();
                      return;
                    }

                    this.meetingAiService
                      .generateAiResult(createdMeeting.id)
                      .subscribe({
                        next: () => {
                          finishLogging();
                        },
                        error: (error) => {
                          console.error(
                            'Meeting was logged, but AI processing failed',
                            error
                          );

                          alert(
                            'The meeting and transcript were saved, but the AI summary could not be generated.'
                          );

                          finishLogging();
                        }
                      });
                  },
                  error: (error) => {
                    console.error(
                      'Failed to save transcript',
                      error
                    );

                    this.isLoggingMeeting =
                      false;

                    this.logMeetingError =
                      'The meeting was created, but the transcript could not be saved.';

                    this.cdr.markForCheck();
                  }
                });
            },
            error: (error) => {
              console.error(
                'Failed to log meeting',
                error
              );

              this.isLoggingMeeting = false;
              this.logMeetingError =
                error.error?.message ||
                'The meeting could not be logged.';

              this.cdr.markForCheck();
            }
          });
      })
      .catch((error) => {
        console.error(
          'Failed to read transcript',
          error
        );

        this.isLoggingMeeting = false;
        this.transcriptError =
          'The transcript file could not be read.';

        this.cdr.markForCheck();
      });
  }
}