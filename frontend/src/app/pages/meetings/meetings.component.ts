import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface MeetingRow {
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
    { title: 'Product Launch Meeting', dateTime: 'Jul 12, 2026 · 10:00 AM', attendees: 3, actionItems: 4 },
    { title: 'Quarterly Performance Sync', dateTime: 'Jul 2, 2026 · 10:00 AM', attendees: 6, actionItems: 2 },
    { title: 'Design Workshop', dateTime: 'Jun 28, 2026 · 2:00 PM', attendees: 4, actionItems: 1 },
    { title: 'Client Onboarding Call', dateTime: 'Jun 25, 2026 · 11:00 AM', attendees: 3, actionItems: 3 },
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
  notifyPeople = true;
  addToCalendar = true;

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
    this.notifyPeople = true;
    this.addToCalendar = true;
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

  createMeeting(): void {
    if (!this.newMeetingName.trim()) {
      return;
    }

    this.meetings.unshift({
      title: this.newMeetingName,
      dateTime: `${this.newMeetingDate || 'TBD'} · ${this.newMeetingTime || 'TBD'}`,
      attendees: this.invitedPeople.length,
      actionItems: 0,
    });

    this.closeCreateModal();
  }
}