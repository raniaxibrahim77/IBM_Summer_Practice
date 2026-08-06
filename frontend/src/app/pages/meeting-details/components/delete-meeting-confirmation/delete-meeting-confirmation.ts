import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MeetingService } from '../../../../services/meeting.service';

@Component({
  selector: 'app-delete-meeting-confirmation',
  imports: [],
  templateUrl: './delete-meeting-confirmation.html',
  styleUrl: './delete-meeting-confirmation.css',
})
export class DeleteMeetingConfirmation {
  @Input({ required: true }) meetingId = '';
  @Input({ required: true }) meetingTitle = '';

  @Output() cancelled = new EventEmitter<void>();
  @Output() meetingDeleted = new EventEmitter<void>();

  isDeleting = false;
  deleteError = '';

  constructor(
    private meetingService: MeetingService,
    private cdr: ChangeDetectorRef,
  ) {}

  cancel(): void {
    if (this.isDeleting) {
      return;
    }

    this.deleteError = '';
    this.cancelled.emit();
  }

  confirmDelete(): void {
    if (!this.meetingId || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.deleteError = '';

    this.meetingService
      .deleteMeeting(this.meetingId)
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.meetingDeleted.emit();
        },
        error: (error) => {
          console.error(
            'Failed to delete meeting',
            error,
          );

          this.isDeleting = false;
          this.deleteError =
            error.error?.message ||
            'The meeting could not be deleted. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }
}