import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MeetingService, MeetingResponse } from '../../services/meeting.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { DeleteMeetingConfirmation } from './components/delete-meeting-confirmation/delete-meeting-confirmation';
import { MeetingAttendees } from './components/meeting-attendees/meeting-attendees';
import { MeetingTranscript } from './components/meeting-transcript/meeting-transcript';
import { MeetingAssistant } from './components/meeting-assistant/meeting-assistant';
import { MeetingSummary, MeetingProcessingStatusLabel } from './components/meeting-summary/meeting-summary';

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeaderComponent,
    SidebarComponent,
    DeleteMeetingConfirmation,
    MeetingAttendees,
    MeetingTranscript,
    MeetingAssistant,
    MeetingSummary,
  ],
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

  transcriptText = '';

  showDeleteMeetingConfirmation = false;

  attendeesRefreshKey = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private cdr: ChangeDetectorRef,
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

  refreshAttendees(): void {
    this.attendeesRefreshKey++;
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
  }

  private formatMeetingProcessingStatus(status: string): MeetingProcessingStatusLabel {
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
    this.date =
      d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    this.status = this.formatMeetingProcessingStatus(m.processingStatus);
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

  openDeleteMeetingConfirmation(): void {
    this.showDeleteMeetingConfirmation = true;
  }

  closeDeleteMeetingConfirmation(): void {
    this.showDeleteMeetingConfirmation = false;
  }

  handleMeetingDeleted(): void {
    this.showDeleteMeetingConfirmation = false;
    this.router.navigate(['/meetings']);
  }
}
