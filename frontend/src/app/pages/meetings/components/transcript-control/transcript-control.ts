import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { TranscriptService } from '../../../../services/transcript.service';
import { DeleteTranscriptConfirmation } from '../delete-transcript-confirmation/delete-transcript-confirmation';

@Component({
  selector: 'app-transcript-control',
  imports: [DeleteTranscriptConfirmation],
  templateUrl: './transcript-control.html',
  styleUrl: './transcript-control.css',
})
export class TranscriptControl {
  @Input({ required: true }) meetingId = '';
  @Input({ required: true }) meetingTitle = '';
  @Input() hasTranscript = false;

  @Output() hasTranscriptChange = new EventEmitter<boolean>();

  showDeleteConfirmation = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private transcriptService: TranscriptService,
    private cdr: ChangeDetectorRef,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.clearMessage();

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.showMessage('Please upload a .txt file.', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;

      this.transcriptService
        .createTranscript(this.meetingId, content)
        .subscribe({
          next: () => {
            this.updateTranscriptState(true);

            this.showMessage(
              `Transcript added.`,
              'success',
            );
          },
          error: (error) => {
            if (error.status === 409) {
              this.updateTranscript(content);
              return;
            }

            console.error('Failed to create transcript', error);

            this.showMessage(
              'The transcript could not be uploaded.',
              'error',
            );
          },
        });
    };

    reader.onerror = () => {
      this.showMessage(
        'The transcript file could not be read.',
        'error',
      );
    };

    reader.readAsText(file);
    input.value = '';
  }

  openDeleteConfirmation(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showDeleteConfirmation = true;
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
  }

  handleTranscriptDeleted(): void {
    this.showDeleteConfirmation = false;
    this.updateTranscriptState(false);
    this.cdr.markForCheck();
  }

  clearMessage(): void {
    this.message = '';
  }

  private updateTranscript(content: string): void {
    this.transcriptService
      .updateTranscript(this.meetingId, content)
      .subscribe({
        next: () => {
          this.updateTranscriptState(true);

          this.showMessage(
            `Transcript updated.`,
            'success',
          );
        },
        error: (error) => {
          console.error('Failed to update transcript', error);

          this.showMessage(
            'The transcript could not be updated.',
            'error',
          );
        },
      });
  }

  private updateTranscriptState(hasTranscript: boolean): void {
    this.hasTranscript = hasTranscript;
    this.hasTranscriptChange.emit(hasTranscript);
  }

  private showMessage(
    message: string,
    type: 'success' | 'error',
  ): void {
    this.message = message;
    this.messageType = type;
    this.cdr.markForCheck();
  }
}