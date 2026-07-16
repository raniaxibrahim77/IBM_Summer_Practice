import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Task {
  title: string;
  meta: string;
  done: boolean;
  tag: string;
}

interface RecentMeeting {
  title: string;
  date: string;
  attendees: number;
  tag: string;
}

interface UpcomingEvent {
  day: string;
  date: string;
  title: string;
  time: string;
}

interface CalendarDay {
  day: number;
  muted: boolean;
  hasMeeting: boolean;
  isToday: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,  RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  tasks: Task[] = [
    { title: 'Review client feedback for Project X', meta: 'Due at 4:00 PM', done: false, tag: 'Project X' },
    { title: 'Draft weekly internal newsletter', meta: 'Completed', done: true, tag: 'Marketing' },
    { title: 'Prepare slides for Stakeholder Meeting', meta: 'Tomorrow at 9:00 AM', done: false, tag: 'Presentation' },
  ];

  readonly recentMeetings: RecentMeeting[] = [
    { title: 'Quarterly Performance Sync', date: 'Jul 2, 2026', attendees: 6, tag: 'Strategy' },
    { title: 'Design Workshop', date: 'Jun 28, 2026', attendees: 4, tag: 'Design' },
    { title: 'Client Onboarding Call', date: 'Jun 25, 2026', attendees: 3, tag: 'Client' },
  ];

  readonly upcomingEvents: UpcomingEvent[] = [
    { day: 'MON', date: '08', title: 'Board Review', time: '09:00 - 10:30 AM' },
    { day: 'TUE', date: '09', title: 'Design Workshop', time: '02:00 - 04:00 PM' },
    { day: 'THU', date: '11', title: 'Client Sync', time: '11:00 - 11:30 AM' },
  ];

  readonly weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  private today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0-indexed

  calendarDays: CalendarDay[] = [];

  constructor() {
    this.buildCalendar();
  }

  get viewMonthLabel(): string {
    return `${MONTH_NAMES[this.viewMonth]} ${this.viewYear}`;
  }

  previousMonth(): void {
    this.viewMonth--;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    this.viewMonth++;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    this.buildCalendar();
  }

  private buildCalendar(): void {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

    const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.viewYear, this.viewMonth, 0).getDate();

    const isCurrentRealMonth =
      this.viewYear === this.today.getFullYear() && this.viewMonth === this.today.getMonth();

    const cells: CalendarDay[] = [];

    for (let i = firstWeekday - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, muted: true, hasMeeting: false, isToday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        muted: false,
        hasMeeting: false,
        isToday: isCurrentRealMonth && d === this.today.getDate(),
      });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay++, muted: true, hasMeeting: false, isToday: false });
    }

    this.calendarDays = cells;
  }

  toggleTaskDone(task: Task): void {
    task.done = !task.done;
    task.meta = task.done ? 'Completed' : task.meta.replace('Completed', 'Due today');
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

    // TODO: multipart POST to your backend — meeting metadata + transcript file.
    // Backend kicks off async processing (per your AIResult/status-polling design);
    // this mock just marks it "Processing" until you wire the real endpoint + polling.
    console.log('Creating meeting with transcript:', this.transcriptFile.name);

    this.closeCreateModal();
  }
}