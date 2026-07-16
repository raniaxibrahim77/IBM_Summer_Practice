import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface MeetingRow {
  id: number
  title: string;
  dateTime: string;
  attendees: number;
  actionItems: number;
}

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css',
})
export class MeetingsComponent {
  searchTerm = '';

  readonly meetings: MeetingRow[] = [
    {id: 1, title: 'Product Launch Meeting', dateTime: 'Jul 12, 2026 · 10:00 AM', attendees: 3, actionItems: 4 },
    {id: 2, title: 'Quarterly Performance Sync', dateTime: 'Jul 2, 2026 · 10:00 AM', attendees: 6, actionItems: 2 },
    {id: 3, title: 'Design Workshop', dateTime: 'Jun 28, 2026 · 2:00 PM', attendees: 4, actionItems: 1 },
    {id: 4, title: 'Client Onboarding Call', dateTime: 'Jun 25, 2026 · 11:00 AM', attendees: 3, actionItems: 3 },
  ];

  get filteredMeetings(): MeetingRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.meetings;
    }
    return this.meetings.filter((m) => m.title.toLowerCase().includes(term));
  }

  // --- Create Meeting modal state ---
  showCreateModal = false;

  newMeetingName = '';
  newMeetingDate = '';
  newMeetingTime = '';
  peopleSearch = '';
  processWithAI = true;
    
  transcriptFile: File | null = null;
  transcriptError: string | null = null;

  readonly allPeople = ['Alex', 'Alex Baker', 'Alex Caleb', 'Ana Barbona', 'Maria Maria', 'Roana'];
  invitedPeople: string[] = [];

  get peopleSuggestions(): string[] {
    const term = this.peopleSearch.trim().toLowerCase();
    if (!term) {
      return [];
    }
    return this.allPeople.filter(
      (p) => p.toLowerCase().includes(term) && !this.invitedPeople.includes(p)
    );
  }

  openCreateModal(): void {
    this.showCreateModal = true;
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
  }

  addPerson(person: string): void {
    if (!this.invitedPeople.includes(person)) {
      this.invitedPeople.push(person);
    }
    this.peopleSearch = '';
  }

  removePerson(person: string): void {
    this.invitedPeople = this.invitedPeople.filter((p) => p !== person);
  }

  onTranscriptFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.transcriptFile = null;
      return;
    }

    const isValidType = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.docx');
    if (!isValidType) {
      this.transcriptError = 'Please upload a .txt or .docx file.';
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

  createMeeting(): void {
    if (!this.newMeetingName.trim()) {
      return;
    }
    if (!this.transcriptFile) {
      this.transcriptError = 'A transcript file is required to create a meeting.';
      return;
    }
  
    const nextId = Math.max(0, ...this.meetings.map((m) => m.id)) + 1;
    this.meetings.unshift({
      id: nextId,
      title: this.newMeetingName,
      dateTime: `${this.newMeetingDate || 'TBD'} · ${this.newMeetingTime || 'TBD'}`,
      attendees: this.invitedPeople.length,
      actionItems: 0,
    });

    // TODO: multipart POST to your backend — meeting metadata + transcript file.
    console.log('Creating meeting with transcript:', this.transcriptFile.name);
    this.closeCreateModal();
  }
}