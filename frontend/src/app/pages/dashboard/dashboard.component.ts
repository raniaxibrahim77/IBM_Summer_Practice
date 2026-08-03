import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MeetingResponse } from '../../services/meeting.service';
import { CalendarDay, DashboardService, MeetingProcessingStatusLabel, RecentMeeting, Task, UpcomingEvent } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { CreateMeetingModal } from './components/create-meeting-modal/create-meeting-modal';


const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, CreateMeetingModal],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];

  recentMeetings: RecentMeeting[] = [];

  upcomingEvents: UpcomingEvent[] = [];

  readonly weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  private today = new Date();

  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth(); // 0-indexed

  private meetings: MeetingResponse[] = [];

  calendarDays: CalendarDay[] = [];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.buildCalendar();
  }

  ngOnInit(): void {
    this.loadRecentMeetings();
    this.loadTasks();
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
    const term =
      this.searchTerm.trim().toLowerCase();

    return this.tasks.filter((task) => {
      const isActive = !task.done;

      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term);

      return isActive && matchesSearch;
    });
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

  // --- Create Meeting modal coordination ---
  showCreateModal = false;
  meetingSuccessMessage = '';

  openCreateModal(): void {
    this.meetingSuccessMessage = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  handleMeetingCreated(attendeeCount: number): void {
    this.showCreateModal = false;

    this.meetingSuccessMessage =
      attendeeCount === 1
        ? 'Meeting created successfully with 1 attendee.'
        : `Meeting created successfully with ${attendeeCount} attendees.`;

    this.loadRecentMeetings();
    this.cdr.markForCheck();
  }
}