import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { TranscriptService } from '../../../../services/transcript.service';

@Component({
  selector: 'app-delete-transcript-confirmation',
  imports: [],
  templateUrl: './delete-transcript-confirmation.html',
  styleUrl: './delete-transcript-confirmation.css',
})
export class DeleteTranscriptConfirmation {
  @Input() meetingId = '';
  @Input() meetingTitle = '';

  @Output() cancelled = new EventEmitter<void>();
  @Output() transcriptDeleted = new EventEmitter<void>();

  isDeleting = false;
  deleteError = '';

  constructor(
    private transcriptService: TranscriptService,
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

    this.transcriptService.deleteTranscript(this.meetingId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.cdr.markForCheck();
        this.transcriptDeleted.emit();
      },
      error: (error) => {
        console.error('Failed to delete transcript', error);

        this.isDeleting = false;
        this.deleteError =
          error.error?.message ||
          'The transcript could not be deleted. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }
}