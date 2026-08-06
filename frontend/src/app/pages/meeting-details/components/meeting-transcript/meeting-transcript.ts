import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { TranscriptService } from '../../../../services/transcript.service';

@Component({
  selector: 'app-meeting-transcript',
  imports: [],
  templateUrl: './meeting-transcript.html',
  styleUrl: './meeting-transcript.css',
})
export class MeetingTranscript implements OnChanges {
  @Input({ required: true }) meetingId = '';
  @Input({ required: true }) meetingTitle = '';
  @Input() transcriptText = '';

  @Output() transcriptTextChange =
    new EventEmitter<string>();

  isUploading = false;
  uploadError = '';

  constructor(
    private transcriptService: TranscriptService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['meetingId'] &&
      this.meetingId
    ) {
      this.loadTranscript();
    }
  }

  onTranscriptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file || this.isUploading) {
      return;
    }

    this.uploadError = '';

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.uploadError =
        'Please select a .txt file.';

      input.value = '';
      return;
    }

    this.isUploading = true;

    file
      .text()
      .then((content) => {
        if (!content.trim()) {
          this.isUploading = false;
          this.uploadError =
            'The transcript file is empty.';

          this.cdr.markForCheck();
          return;
        }

        this.transcriptService
          .createTranscript(
            this.meetingId,
            content,
          )
          .subscribe({
            next: () => {
              this.updateTranscriptText(content);
              this.isUploading = false;
              this.uploadError = '';
              input.value = '';
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error(
                'Failed to upload transcript',
                error,
              );

              this.isUploading = false;
              this.uploadError =
                error.error?.message ||
                'The transcript could not be uploaded.';

              input.value = '';
              this.cdr.markForCheck();
            },
          });
      })
      .catch((error) => {
        console.error(
          'Failed to read transcript file',
          error,
        );

        this.isUploading = false;
        this.uploadError =
          'The transcript file could not be read.';

        input.value = '';
        this.cdr.markForCheck();
      });
  }

  downloadTranscript(): void {
    if (!this.transcriptText) {
      return;
    }

    const blob = new Blob(
      [this.transcriptText],
      { type: 'text/plain' },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download =
      `${this.meetingTitle.replace(/\s+/g, '_')}` +
      '_transcript.txt';

    link.click();
    URL.revokeObjectURL(url);
  }

  private loadTranscript(): void {
    this.transcriptService
      .getTranscript(this.meetingId)
      .subscribe({
        next: (transcript) => {
          this.updateTranscriptText(
            transcript.content,
          );

          this.cdr.markForCheck();
        },
        error: () => {
          // A missing transcript is an expected state.
          this.updateTranscriptText('');
          this.cdr.markForCheck();
        },
      });
  }

  private updateTranscriptText(
    transcriptText: string,
  ): void {
    this.transcriptText = transcriptText;
    this.transcriptTextChange.emit(
      transcriptText,
    );
  }
}