import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MeetingService, MeetingResponse } from '../../services/meeting.service';
import { ActionItemService, ActionItemResponse } from '../../services/action-item.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CalendarGridComponent } from './calendar-grid/calendar-grid.component';
import { TaskRemindersPanelComponent } from './task-reminders-panel/task-reminders-panel.component';
import { MeetingTimelineComponent } from './meeting-timeline/meeting-timeline.component';
import {
  CalendarCell,
  TaskReminder,
  TimelineItem,
  buildCalendarCells,
  buildTaskReminders,
  buildTimeline,
} from './calendar-view.util';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    CalendarGridComponent,
    TaskRemindersPanelComponent,
    MeetingTimelineComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  private today = new Date();
  viewYear = this.today.getFullYear();
  viewMonth = this.today.getMonth();

  readonly weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  cells: CalendarCell[] = [];
  taskReminders: TaskReminder[] = [];
  timeline: TimelineItem[] = [];

  private meetings: MeetingResponse[] = [];
  private actionItems: ActionItemResponse[] = [];

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private actionItemService: ActionItemService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.meetingService.getMeetings(this.authService.getCurrentUser()?.id).subscribe({
      next: (meetings) => {
        this.meetings = meetings;
        this.rebuildCalendar();
        this.timeline = buildTimeline(this.meetings);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load meetings', err),
    });

    this.actionItemService.getActionItems().subscribe({
      next: (items) => {
        this.actionItems = items;
        this.taskReminders = buildTaskReminders(this.actionItems);
        this.rebuildCalendar();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load action items', err),
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
    this.rebuildCalendar();
  }

  nextMonth(): void {
    this.viewMonth++;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear++;
    }
    this.rebuildCalendar();
  }

  goToToday(): void {
    this.viewYear = this.today.getFullYear();
    this.viewMonth = this.today.getMonth();
    this.rebuildCalendar();
  }

  toggleTask(task: TaskReminder): void {
    const newStatus = task.done ? 'OPEN' : 'DONE';
    this.actionItemService.updateStatus(task.id, newStatus).subscribe({
      next: (updated) => {
        const item = this.actionItems.find((i) => i.id === updated.id);
        if (item) {
          item.status = updated.status;
          item.deadline = updated.deadline;
        }
        this.taskReminders = buildTaskReminders(this.actionItems);
        this.rebuildCalendar();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to update task status', err),
    });
  }

  goToMeeting(id: string): void {
    this.router.navigate(['/meeting-details', id]);
  }

  private rebuildCalendar(): void {
    this.cells = buildCalendarCells(this.viewYear, this.viewMonth, this.today, this.meetings, this.actionItems);
  }
}