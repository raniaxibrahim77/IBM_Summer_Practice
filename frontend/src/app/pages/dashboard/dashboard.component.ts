import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingCreateRequest, MeetingResponse, MeetingService } from '../../services/meeting.service';
import { CalendarDay, DashboardService, MeetingProcessingStatusLabel, RecentMeeting, Task, UpcomingEvent } from '../../services/dashboard.service';
import { AttendeeResponse, AttendeeService } from '../../services/attendee.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';


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
    private dashboardService: DashboardService,
    private authService: AuthService,
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

  getMeetingProcessingStatusClasses(
    status: MeetingProcessingStatusLabel
  ): string {
    switch (status) {
      case 'Processed':
        return 'status-processed';

      case 'Processing':
        return 'status-processing';

      case 'Failed':
        return 'status-failed';

      default:
        return 'status-not-processed';
    }
  }

  private loadRecentMeetings(): void {
    const ownerId =
      this.authService.getCurrentUser()?.id;

    this.dashboardService
      .loadMeetingOverview(ownerId)
      .subscribe({
        next: (overview) => {
          this.meetings =
            overview.meetings;

          this.recentMeetings =
            overview.recentMeetings;

          this.upcomingEvents =
            overview.upcomingEvents;

          this.buildCalendar();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to load recent meetings',
            error
          );
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

  private loadTasks(): void {
    this.dashboardService
      .loadTasks()
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to load tasks',
            error
          );
        }
      });
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
    this.calendarDays =
      this.dashboardService.buildCalendar(
        this.meetings,
        this.viewYear,
        this.viewMonth,
        this.today
      );
  }
  toggleTaskDone(task: Task): void {
    this.dashboardService
      .updateTaskStatus(task)
      .subscribe({
        next: (updatedTask) => {
          Object.assign(
            task,
            updatedTask
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to update task',
            error
          );
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