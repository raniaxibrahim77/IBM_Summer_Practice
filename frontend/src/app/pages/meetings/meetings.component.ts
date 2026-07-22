import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingService, MeetingResponse } from '../../services/meeting.service';

interface MeetingRow {
  id: string;
  title: string;
  dateTime: string;
  attendees: number;
  transcriptFile: File | null;
}

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meetings.component.html',
  styleUrl: './meetings.component.css',
})
export class MeetingsComponent implements OnInit {
  searchTerm = '';

  meetings: MeetingRow[] = [];

  constructor(
    private meetingService: MeetingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.meetingService.getMeetings().subscribe({
      next: (meetings) => {
        this.meetings = meetings.map((m) => this.toMeetingRow(m));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load meetings', err),
    });
  }

  private toMeetingRow(m: MeetingResponse): MeetingRow {
    const d = new Date(m.meetingDatetime);
    const dateTime = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

      return {
      id: m.id,
      title: m.title,
      dateTime,
      attendees: 0, // backend doesn't return attendee count yet
      transcriptFile: null,
    };
  }

  get filteredMeetings(): MeetingRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.meetings;
    }
    return this.meetings.filter((m) => m.title.toLowerCase().includes(term));
  }

  onRowTranscriptSelected(event: Event, meeting: MeetingRow): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }

    const isValidType = file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.docx');
    if (!isValidType) {
      alert('Please upload a .txt or .docx file.');
      input.value = '';
      return;
    }

    meeting.transcriptFile = file;
    input.value = '';

    // TODO: POST this file to your backend, e.g.:
    // const formData = new FormData();
    // formData.append('transcript', file);
    // this.http.post(`/api/meetings/${meeting.id}/transcript`, formData).subscribe();
    console.log(`Transcript "${file.name}" attached to meeting ${meeting.id}`);
  }


  // Meeting modal state 
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
  
    // TODO: replace with a real POST to /api/meetings (multipart: metadata + transcript file),
    // then re-fetch or prepend the returned MeetingResponse instead of faking an id locally.
    console.log('Creating meeting with transcript:', this.transcriptFile.name);
    this.closeCreateModal();
  }
}