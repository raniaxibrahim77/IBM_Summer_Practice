import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ChatMessage {
  from: 'me' | 'other';
  author: string;
  text: string;
  time: string;
}

interface Conversation {
  name: string;
  initials: string;
  lastMessage: string;
  active: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  draft = '';

  readonly conversations: Conversation[] = [
    { name: 'Ana Antonescu', initials: 'AA', lastMessage: "Sounds good, I'll send the slides.", active: true },
    { name: 'Paula Paulescu', initials: 'PP', lastMessage: 'Can we push the sync to 3 PM?', active: false },
    { name: 'Rania J.', initials: 'RJ', lastMessage: 'Approved the Q3 budget.', active: false },
  ];

  messages: ChatMessage[] = [
    { from: 'other', author: 'Ana Antonescu', text: 'Hey! Do you have the latest roadmap deck?', time: '9:14 AM' },
    { from: 'me', author: 'You', text: "Yep, sending it over now.", time: '9:16 AM' },
    { from: 'other', author: 'Ana Antonescu', text: "Sounds good, I'll send the slides.", time: '9:17 AM' },
  ];

  sendMessage(): void {
    const text = this.draft.trim();
    if (!text) {
      return;
    }
    this.messages.push({
      from: 'me',
      author: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    });
    this.draft = '';
  }
}