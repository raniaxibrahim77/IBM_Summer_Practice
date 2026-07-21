import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingCreateRequest, MeetingResponse, MeetingService } from '../../services/meeting.service';
import { ActionItemResponse, ActionItemService } from '../../services/action-item.service';
import { AttendeeResponse, AttendeeService } from '../../services/attendee.service';

interface Task {
  id: string;
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];

  recentMeetings: RecentMeeting[] = [];

  upcomingEvents: UpcomingEvent[] = [];

  attendees: AttendeeResponse[] = [];

  readonly weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  private today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0-indexed

  private meetings: MeetingResponse[] = [];

  calendarDays: CalendarDay[] = [];

  constructor(
    private meetingService: MeetingService,
    private actionItemService: ActionItemService,
    private attendeeService: AttendeeService,
    private cdr: ChangeDetectorRef
  ) {
    this.buildCalendar();
  }

  ngOnInit(): void {
    this.loadRecentMeetings();
    this.loadTasks();
    this.loadAttendees();
  }

  searchTerm = '';

  get filteredRecentMeetings(): RecentMeeting[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.recentMeetings;
    }

    return this.recentMeetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(term)
    );
  }

  get filteredUpcomingEvents(): UpcomingEvent[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.upcomingEvents;
    }

    return this.upcomingEvents.filter((event) =>
      event.title.toLowerCase().includes(term)
    );
  }

  get filteredTasks(): Task[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.tasks;
    }

    return this.tasks.filter((task) =>
      task.title.toLowerCase().includes(term)
    );
  }

  private loadRecentMeetings(): void {
    this.meetingService.getMeetings().subscribe({
      next: (meetings) => {
        this.meetings = meetings;
        this.recentMeetings = meetings
          .slice()
          .sort(
            (a, b) =>
              new Date(b.meetingDatetime).getTime() -
              new Date(a.meetingDatetime).getTime()
          )
          .slice(0, 3)
          .map((meeting) => this.toRecentMeeting(meeting));

        const now = new Date();

        this.upcomingEvents = meetings
          .filter((meeting) => new Date(meeting.meetingDatetime) >= now)
          .sort(
            (a, b) =>
              new Date(a.meetingDatetime).getTime() -
              new Date(b.meetingDatetime).getTime()
          )
          .slice(0, 3)
          .map((meeting) => this.toUpcomingEvent(meeting));

        this.buildCalendar();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load recent meetings', error);
      }
    });
  }

  private loadAttendees(): void {
    this.attendeeService.getAttendees().subscribe({
      next: (attendees) => {
        this.attendees = attendees;
        console.log('Attendees received:', attendees);
      },
      error: (error) => {
        console.error('Failed to load attendees', error);
      }
    });
  }

  private toRecentMeeting(meeting: MeetingResponse): RecentMeeting {
    const date = new Date(meeting.meetingDatetime);

    return {
      title: meeting.title,
      date: date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      attendees: meeting.attendeeCount,
      tag: meeting.processingStatus
    };
  }

  private toUpcomingEvent(meeting: MeetingResponse): UpcomingEvent {
    const date = new Date(meeting.meetingDatetime);

    return {
      day: date
        .toLocaleDateString([], { weekday: 'short' })
        .toUpperCase(),
      date: date.getDate().toString().padStart(2, '0'),
      title: meeting.title,
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  private loadTasks(): void {
    this.actionItemService.getActionItems().subscribe({
      next: (items) => {
        this.tasks = items
          .slice(0, 3)
          .map((item) => this.toTask(item));
      },
      error: (error) => {
        console.error('Failed to load tasks', error);
      }
    });
  }

  private toTask(item: ActionItemResponse): Task {
    return {
      id: item.id,
      title: item.description,
      meta: item.deadline
        ? `Due ${new Date(item.deadline).toLocaleDateString()}`
        : 'No deadline',
      done: item.status === 'DONE',
      tag: item.proposedAssignee || 'Unassigned'
    };
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
      const hasMeeting = this.meetings.some((meeting) => {
        const date = new Date(meeting.meetingDatetime);

        return (
          date.getFullYear() === this.viewYear &&
          date.getMonth() === this.viewMonth &&
          date.getDate() === d
        );
      });

      cells.push({
        day: d,
        muted: false,
        hasMeeting,
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
    const newStatus = task.done ? 'OPEN' : 'DONE';

    this.actionItemService.updateStatus(task.id, newStatus).subscribe({
      next: (updatedItem) => {
        task.done = updatedItem.status === 'DONE';
        task.meta = task.done
          ? 'Completed'
          : updatedItem.deadline
            ? `Due ${new Date(updatedItem.deadline).toLocaleDateString()}`
            : 'No deadline';
      },
      error: (error) => {
        console.error('Failed to update task', error);
      }
    });
  }

  // --- Create Meeting modal state ---
  showCreateModal = false;
  isCreatingMeeting = false;
  showAddAttendeeForm = false;
  isCreatingAttendee = false;
  createMeetingError = '';
  newMeetingName = '';
  newMeetingDate = '';
  newMeetingTime = '';
  peopleSearch = '';
  newAttendeeName = '';
  newAttendeeEmail = '';
  createAttendeeError = ''; 
  notifyPeople = true;
  addToCalendar = true;

  invitedPeople: AttendeeResponse[] = [];

  get peopleSuggestions(): AttendeeResponse[] {
    const term = this.peopleSearch.trim().toLowerCase();

    if (!term) {
      return [];
    }
    return this.attendees.filter((attendee) => {
      const matchesSearch =
        attendee.name.toLowerCase().includes(term) ||
        (attendee.email?.toLowerCase().includes(term) ?? false);

      const alreadyInvited = this.invitedPeople.some(
        (invited) => invited.id === attendee.id
      );
      return matchesSearch && !alreadyInvited;
    });
  }

  openCreateModal(): void {
    this.createMeetingError = '';
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
    this.isCreatingMeeting = false;
    this.createMeetingError = '';
    this.showAddAttendeeForm = false;
    this.isCreatingAttendee = false;
    this.newAttendeeName = '';
    this.newAttendeeEmail = '';
    this.createAttendeeError = '';
  }

  openAddAttendeeForm(): void {
    this.newAttendeeName = this.peopleSearch.trim();
    this.newAttendeeEmail = '';
    this.createAttendeeError = '';
    this.showAddAttendeeForm = true;
  }

  closeAddAttendeeForm(): void {
    this.showAddAttendeeForm = false;
    this.isCreatingAttendee = false;
    this.newAttendeeName = '';
    this.newAttendeeEmail = '';
    this.createAttendeeError = '';
  }

  addPerson(attendee: AttendeeResponse): void {
    const alreadyInvited = this.invitedPeople.some(
      (invited) => invited.id === attendee.id
    );

    if (!alreadyInvited) {
      this.invitedPeople.push(attendee);
    }
    this.peopleSearch = '';
  }

  removePerson(attendeeId: string): void {
    this.invitedPeople = this.invitedPeople.filter(
      (attendee) => attendee.id !== attendeeId
    );
  }

  createMeeting(): void {
    this.createMeetingError = '';

    if (!this.newMeetingName.trim()) {
        this.createMeetingError = 'Please enter a meeting name.';
    return;
    }
    if (!this.newMeetingDate) {
      this.createMeetingError = 'Please select a meeting date.';
      return;
    }
    if (!this.newMeetingTime) {
      this.createMeetingError = 'Please select a meeting time.';
     return;
    }
    if (this.isCreatingMeeting) {
      return;
    }

    const request: MeetingCreateRequest = {
      title: this.newMeetingName.trim(),
      description: '',
      meetingDatetime: `${this.newMeetingDate}T${this.newMeetingTime}:00`,
      ownerId: null,
      attendeeIds: this.invitedPeople.map((attendee) => attendee.id)
    };

    this.isCreatingMeeting = true;

    this.meetingService.createMeeting(request).subscribe({
      next: () => {
        this.isCreatingMeeting = false;
        this.closeCreateModal();
        this.loadRecentMeetings();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to create meeting', error);

        this.isCreatingMeeting = false;
        this.createMeetingError =
          error.error?.message ||
          'The meeting could not be created. Please try again.';

          this.cdr.markForCheck();
      }
    });
  }

  createAttendee(): void {
    this.createAttendeeError = '';

    const name = this.newAttendeeName.trim();
    const email = this.newAttendeeEmail.trim();

    if (!name) {
      this.createAttendeeError =
        'Please enter the attendee name.';
      return;
    }

    if (this.isCreatingAttendee) {
      return;
    }

    this.isCreatingAttendee = true;

    this.attendeeService.createAttendee({
      name,
      email: email || null
    }).subscribe({
      next: (createdAttendee) => {
        this.attendees = [
          ...this.attendees,
          createdAttendee
        ];

        this.invitedPeople = [
          ...this.invitedPeople,
          createdAttendee
        ];

        this.peopleSearch = '';
        this.closeAddAttendeeForm();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to create attendee', error);

        this.isCreatingAttendee = false;
        this.createAttendeeError =
          error.error?.message ||
          'The attendee could not be created.';

        this.cdr.markForCheck();
      }
    });
  }
}