import {
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MeetingAiService } from '../../../../services/meeting-ai.service';

interface ChatMessage {
  from: 'assistant' | 'user';
  text: string;
}

@Component({
  selector: 'app-meeting-assistant',
  imports: [FormsModule],
  templateUrl: './meeting-assistant.html',
  styleUrl: './meeting-assistant.css',
})
export class MeetingAssistant {
  @Input({ required: true }) meetingId = '';

  chatInput = '';
  isSendingMessage = false;

  chatMessages: ChatMessage[] = [
    {
      from: 'assistant',
      text:
        "Hi, I've read through this meeting. " +
        'Want a summary, key risks, or the action items again?',
    },
  ];

  constructor(
    private meetingAiService: MeetingAiService,
    private cdr: ChangeDetectorRef,
  ) {}

  runQuickAction(
    action: 'summarize' | 'risks' | 'followup',
  ): void {
    const prompts: Record<typeof action, string> = {
      summarize: 'Summarize this meeting',
      risks: 'What are the key risks?',
      followup: 'Draft follow-up notes',
    };

    this.sendMessage(prompts[action]);
  }

  sendMessage(text?: string): void {
    const content = (
      text ?? this.chatInput
    ).trim();

    if (
      !content ||
      !this.meetingId ||
      this.isSendingMessage
    ) {
      return;
    }

    const previousMessages =
      this.chatMessages.map((message) => ({
        role: message.from,
        text: message.text,
      }));

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
            error,
          );

          this.chatMessages.push({
            from: 'assistant',
            text: this.getAiErrorMessage(
              error,
              'Your question could not be answered.',
            ),
          });

          this.isSendingMessage = false;
          this.cdr.markForCheck();
        },
      });
  }

  private getAiErrorMessage(
    error: any,
    fallback: string,
  ): string {
    if (error.status === 404) {
      return 'This meeting does not have a transcript yet.';
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
}