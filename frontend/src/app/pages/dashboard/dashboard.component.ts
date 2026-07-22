import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingCreateRequest, MeetingResponse, MeetingService } from '../../services/meeting.service';
import { ActionItemResponse, ActionItemService } from '../../services/action-item.service';
import { AttendeeResponse, AttendeeService } from '../../services/attendee.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';

interface Task {
  id: string;
  title: string;
  meta: string;
  done: boolean;
  tag: string;
}

interface RecentMeeting {
  id: string;
  title: string;
  date: string;
  attendees: number;
  tag: string;
}

interface UpcomingEvent {
  id: string;
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
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
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
  readonly minimumMeetingDate =
    `${this.today.getFullYear()}-` +
    `${(this.today.getMonth() + 1).toString().padStart(2, '0')}-` +
    `${this.today.getDate().toString().padStart(2, '0')}`;
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0-indexed

  private meetings: MeetingResponse[] = [];

  calendarDays: CalendarDay[] = [];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
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
    this.meetingService.getMeetings(this.authService.getCurrentUser()?.id).subscribe({
      next: (meetings) => {
        const now = new Date();

        this.meetings = meetings;

        this.recentMeetings = meetings
          .filter(
            (meeting) =>
                new Date(meeting.meetingDatetime).getTime() <=
                now.getTime()
          )
          .sort(
            (a, b) =>
              new Date(b.meetingDatetime).getTime() -
              new Date(a.meetingDatetime).getTime()
          )
          .slice(0, 3)
          .map((meeting) => this.toRecentMeeting(meeting));

          this.upcomingEvents = meetings
            .filter(
              (meeting) =>
                new Date(meeting.meetingDatetime).getTime() >
                now.getTime()
          )
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
    this.isLoadingAttendees = true;
    this.attendeeLoadError = '';

    this.attendeeService.getAttendees().subscribe({
      next: (attendees) => {
        this.attendees = attendees;
        this.isLoadingAttendees = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load attendees', error);
        this.isLoadingAttendees = false;
        this.attendeeLoadError =
          'Attendees could not be loaded. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  private toRecentMeeting(meeting: MeetingResponse): RecentMeeting {
    const date = new Date(meeting.meetingDatetime);

    return {
      id: meeting.id,
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
      id: meeting.id,
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
  isLoadingAttendees = false;
  peopleSearchFocused = false;
  createMeetingError = '';
  newMeetingName = '';
  newMeetingDate = '';
  newMeetingTime = '';
  peopleSearch = '';
  newAttendeeName = '';
  newAttendeeEmail = '';
  createAttendeeError = '';
  attendeeLoadError = '';
  meetingSuccessMessage = ''; 

  invitedPeople: AttendeeResponse[] = [];

  get peopleSuggestions(): AttendeeResponse[] {
    if (!this.peopleSearchFocused) {
      return [];
    }

    const term = this.peopleSearch.trim().toLowerCase();
    
    const availableAttendees = this.attendees.filter(
      (attendee) =>
        !this.invitedPeople.some(
          (invited) => invited.id === attendee.id
        )
    );

    if (!term) {
      return availableAttendees.slice(0, 5);
    }

    return availableAttendees
      .filter((attendee) =>
        attendee.name.toLowerCase().includes(term) ||
        (attendee.email?.toLowerCase().includes(term) ?? false)
      )
      .slice(0, 5);
  }

  openCreateModal(): void {
    this.createMeetingError = '';
    this.meetingSuccessMessage = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newMeetingName = '';
    this.newMeetingDate = '';
    this.newMeetingTime = '';
    this.peopleSearch = '';
    this.invitedPeople = [];
    this.isCreatingMeeting = false;
    this.createMeetingError = '';
    this.showAddAttendeeForm = false;
    this.isCreatingAttendee = false;
    this.newAttendeeName = '';
    this.newAttendeeEmail = '';
    this.createAttendeeError = '';
    this.peopleSearchFocused = false;
  }

  openAddAttendeeForm(): void {
    this.newAttendeeName = this.peopleSearch.trim();
    this.newAttendeeEmail = '';
    this.createAttendeeError = '';
    this.peopleSearch = '';
    this.showAddAttendeeForm = true;
    this.peopleSearchFocused = false;
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
    this.peopleSearchFocused = false;
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
    const meetingDateTime = new Date(
      `${this.newMeetingDate}T${this.newMeetingTime}:00`
    );

    if (
      Number.isNaN(meetingDateTime.getTime()) ||
      meetingDateTime.getTime() <= Date.now()
    ) {
      this.createMeetingError =
        'Please select a future date and time.';
      return;
    }
    if (this.isCreatingMeeting) {
      return;
    }

    const request: MeetingCreateRequest = {
      title: this.newMeetingName.trim(),
      description: '',
      meetingDatetime: `${this.newMeetingDate}T${this.newMeetingTime}:00`,
      ownerId: this.authService.getCurrentUser()?.id ?? null,
      attendeeIds: this.invitedPeople.map((attendee) => attendee.id)
    };

    this.isCreatingMeeting = true;

    this.meetingService.createMeeting(request).subscribe({
      next: () => {
        const attendeeCount = this.invitedPeople.length;

        this.isCreatingMeeting = false;
        this.closeCreateModal();

        this.meetingSuccessMessage =
          attendeeCount === 1
            ? 'Meeting created successfully with 1 attendee.'
            : `Meeting created successfully with ${attendeeCount} attendees.`;

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