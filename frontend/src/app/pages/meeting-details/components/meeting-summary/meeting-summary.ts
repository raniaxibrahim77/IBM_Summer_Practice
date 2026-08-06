import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  AiResultResponse,
  MeetingAiService,
} from '../../../../services/meeting-ai.service';
import { ActionItemService } from '../../../../services/action-item.service';

interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  isUpdating: boolean;
}

export type MeetingProcessingStatusLabel =
  | 'Not processed'
  | 'Processing'
  | 'Processed'
  | 'Failed';

@Component({
  selector: 'app-meeting-summary',
  imports: [],
  templateUrl: './meeting-summary.html',
  styleUrl: './meeting-summary.css',
})
export class MeetingSummary implements OnChanges {
  @Input({ required: true }) meetingId = '';
  @Input() meetingTitle = '';
  @Input() meetingDate = '';
  @Input() transcriptText = '';
  @Input() status: MeetingProcessingStatusLabel =
    'Not processed';

  @Output() statusChange =
    new EventEmitter<MeetingProcessingStatusLabel>();

  @Output() attendeesRefreshRequested =
    new EventEmitter<void>();

  aiSummary =
    'No AI summary is available for this meeting yet.';

  summaryError = '';
  hasAiResult = false;
  actionItems: ActionItem[] = [];
  isGenerating = false;

  constructor(
    private meetingAiService: MeetingAiService,
    private actionItemService: ActionItemService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['meetingId'] &&
      this.meetingId
    ) {
      this.loadLatestAiResult();
    }
  }

  get completedActionCount(): number {
    return this.actionItems.filter(
      (item) => item.done,
    ).length;
  }

  regenerateSummary(): void {
    if (
      !this.meetingId ||
      !this.transcriptText ||
      this.isGenerating
    ) {
      return;
    }

    this.isGenerating = true;
    this.summaryError = '';
    this.updateStatus('Processing');

    this.meetingAiService
      .generateAiResult(this.meetingId)
      .subscribe({
        next: (result) => {
          this.applyAiResult(result);
          this.updateStatus('Processed');
          this.isGenerating = false;

          this.attendeesRefreshRequested.emit();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to generate AI result',
            error,
          );

          this.updateStatus('Failed');
          this.isGenerating = false;

          this.summaryError =
            this.getAiErrorMessage(
              error,
              'The AI summary could not be generated.',
            );

          this.cdr.markForCheck();
        },
      });
  }

  toggleActionItem(item: ActionItem): void {
    if (item.isUpdating) {
      return;
    }

    const previousValue = item.done;
    const nextValue = !previousValue;
    const nextStatus =
      nextValue ? 'DONE' : 'OPEN';

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
            error,
          );

          item.done = previousValue;
          item.isUpdating = false;

          alert(
            'The action item status could not be updated.',
          );

          this.cdr.markForCheck();
        },
      });
  }

  exportSummary(): void {
    if (
      !this.hasAiResult ||
      !this.aiSummary.trim()
    ) {
      return;
    }

    const actionItemLines =
      this.actionItems.length > 0
        ? this.actionItems.map((item) => {
            const checkbox =
              item.done ? '[x]' : '[ ]';

            return `${checkbox} ${item.text}`;
          })
        : ['No action items were generated.'];

    const content = [
      this.meetingTitle,
      '='.repeat(this.meetingTitle.length),
      '',
      `Date: ${this.meetingDate}`,
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
      `Completed: ${this.completedActionCount}` +
        `/${this.actionItems.length}`,
      '',
    ].join('\n');

    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download =
      `${this.toSafeFileName(this.meetingTitle)}` +
      '_summary.txt';

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  private loadLatestAiResult(): void {
    this.meetingAiService
      .getLatestAiResult(this.meetingId)
      .subscribe({
        next: (result) => {
          this.applyAiResult(result);
          this.cdr.markForCheck();
        },
        error: () => {
          // A missing AI result is expected.
        },
      });
  }

  private applyAiResult(
    result: AiResultResponse,
  ): void {
    this.hasAiResult = true;

    this.aiSummary =
      result.conciseSummary ??
      result.detailedSummary ??
      'The AI response did not contain a summary.';

    this.actionItems = (
      result.actionItems ?? []
    ).map((item) => ({
      id: item.id,
      text: item.description,
      done:
        item.status === 'DONE' ||
        item.status === 'COMPLETED',
      isUpdating: false,
    }));
  }

  private updateStatus(
    status: MeetingProcessingStatusLabel,
  ): void {
    this.status = status;
    this.statusChange.emit(status);
  }

  private getAiErrorMessage(
    error: any,
    fallback: string,
  ): string {
    if (error.status === 404) {
      return (
        'This meeting does not have ' +
        'a transcript yet.'
      );
    }

    if (error.status === 503) {
      return (
        'The AI service is unavailable. ' +
        'Make sure Ollama is running.'
      );
    }

    if (error.status === 0) {
      return 'The backend could not be reached.';
    }

    return fallback;
  }

  private toSafeFileName(
    value: string,
  ): string {
    const safeName = value
      .trim()
      .replace(
        /[<>:"/\\|?*\u0000-\u001F]/g,
        '',
      )
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^\.+|\.+$/g, '');

    return safeName || 'meeting';
  }
}