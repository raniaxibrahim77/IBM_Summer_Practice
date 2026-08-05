import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingResponse, MeetingService } from '../../services/meeting.service';
import { TranscriptService } from '../../services/transcript.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { LogMeetingModal } from './components/log-meeting-modal/log-meeting-modal';
import { DeleteTranscriptConfirmation } from './components/delete-transcript-confirmation/delete-transcript-confirmation';

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
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, SidebarComponent, LogMeetingModal, DeleteTranscriptConfirmation],
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

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private transcriptService: TranscriptService,
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
  event: Event,
): void {
  event.preventDefault();
  event.stopPropagation();

  this.meetingPendingTranscriptDelete = meeting;
}

closeDeleteTranscriptConfirmation(): void {
  this.meetingPendingTranscriptDelete = null;
}

handleTranscriptDeleted(): void {
  if (this.meetingPendingTranscriptDelete) {
    this.meetingPendingTranscriptDelete.hasTranscript = false;
  }

  this.meetingPendingTranscriptDelete = null;
  this.cdr.markForCheck();
}
  // Log Meeting modal coordination
  showCreateModal = false;

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  handleMeetingLogged(createdMeeting: MeetingResponse): void {
    const newRow = this.toMeetingRow(createdMeeting);
    newRow.hasTranscript = true;

    this.meetings = [newRow, ...this.meetings];
    this.showCreateModal = false;
    this.cdr.markForCheck();
  }
}