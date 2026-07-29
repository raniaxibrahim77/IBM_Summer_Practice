import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  MeetingResponse,
  MeetingService
} from './meeting.service';

import {
  ActionItemResponse,
  ActionItemService
} from './action-item.service';

export interface Task {
  id: string;
  title: string;
  meta: string;
  done: boolean;
  tag: string;
}

export type MeetingProcessingStatusLabel =
  | 'Not processed'
  | 'Processing'
  | 'Processed'
  | 'Failed';

export interface RecentMeeting {
  id: string;
  title: string;
  date: string;
  attendees: number;
  tag: MeetingProcessingStatusLabel;
}

export interface UpcomingEvent {
  id: string;
  day: string;
  date: string;
  title: string;
  time: string;
}

export interface CalendarDay {
  day: number;
  muted: boolean;
  hasMeeting: boolean;
  isToday: boolean;
}

export interface MeetingOverview {
  meetings: MeetingResponse[];
  recentMeetings: RecentMeeting[];
  upcomingEvents: UpcomingEvent[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private meetingService: MeetingService,
    private actionItemService: ActionItemService
  ) {}

  loadMeetingOverview(
    ownerId?: string
  ): Observable<MeetingOverview> {
    return this.meetingService
      .getMeetings(ownerId)
      .pipe(
        map((meetings) => {
          const now = new Date();

          const recentMeetings = meetings
            .filter(
              (meeting) =>
                new Date(
                  meeting.meetingDatetime
                ).getTime() <= now.getTime()
            )
            .sort(
              (a, b) =>
                new Date(
                  b.meetingDatetime
                ).getTime() -
                new Date(
                  a.meetingDatetime
                ).getTime()
            )
            .slice(0, 3)
            .map((meeting) =>
              this.toRecentMeeting(meeting)
            );

          const upcomingEvents = meetings
            .filter(
              (meeting) =>
                new Date(
                  meeting.meetingDatetime
                ).getTime() > now.getTime()
            )
            .sort(
              (a, b) =>
                new Date(
                  a.meetingDatetime
                ).getTime() -
                new Date(
                  b.meetingDatetime
                ).getTime()
            )
            .slice(0, 3)
            .map((meeting) =>
              this.toUpcomingEvent(meeting)
            );

          return {
            meetings,
            recentMeetings,
            upcomingEvents
          };
        })
      );
  }

  loadTasks(): Observable<Task[]> {
    return this.actionItemService
      .getActionItems()
      .pipe(
        map((items) =>
          items
            .filter(
              (item) =>
                item.status !== 'DONE' &&
                item.status !== 'COMPLETED'
            )
            .slice(0, 3)
            .map((item) =>
              this.toTask(item)
            )
        )
      );
  }

  updateTaskStatus(
    task: Task
  ): Observable<Task> {
    const newStatus =
      task.done ? 'OPEN' : 'DONE';

    return this.actionItemService
      .updateStatus(task.id, newStatus)
      .pipe(
        map((updatedItem) => {
          const updatedTask =
            this.toTask(updatedItem);

          if (updatedTask.done) {
            updatedTask.meta = 'Completed';
          }

          return updatedTask;
        })
      );
  }

  buildCalendar(
    meetings: MeetingResponse[],
    viewYear: number,
    viewMonth: number,
    today: Date
  ): CalendarDay[] {
    const firstOfMonth = new Date(
      viewYear,
      viewMonth,
      1
    );

    const firstWeekday =
      (firstOfMonth.getDay() + 6) % 7;

    const daysInMonth = new Date(
      viewYear,
      viewMonth + 1,
      0
    ).getDate();

    const daysInPreviousMonth = new Date(
      viewYear,
      viewMonth,
      0
    ).getDate();

    const isCurrentMonth =
      viewYear === today.getFullYear() &&
      viewMonth === today.getMonth();

    const cells: CalendarDay[] = [];

    for (
      let index = firstWeekday - 1;
      index >= 0;
      index--
    ) {
      cells.push({
        day: daysInPreviousMonth - index,
        muted: true,
        hasMeeting: false,
        isToday: false
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      const hasMeeting = meetings.some(
        (meeting) => {
          const meetingDate = new Date(
            meeting.meetingDatetime
          );

          return (
            meetingDate.getFullYear() ===
              viewYear &&
            meetingDate.getMonth() ===
              viewMonth &&
            meetingDate.getDate() === day
          );
        }
      );

      cells.push({
        day,
        muted: false,
        hasMeeting,
        isToday:
          isCurrentMonth &&
          day === today.getDate()
      });
    }

    let nextMonthDay = 1;

    while (cells.length % 7 !== 0) {
      cells.push({
        day: nextMonthDay++,
        muted: true,
        hasMeeting: false,
        isToday: false
      });
    }

    return cells;
  }

  private toRecentMeeting(
    meeting: MeetingResponse
  ): RecentMeeting {
    const date = new Date(
      meeting.meetingDatetime
    );

    return {
      id: meeting.id,
      title: meeting.title,
      date: date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      attendees: meeting.attendeeCount,
      tag: this.formatProcessingStatus(
        meeting.processingStatus
      )
    };
  }

  private toUpcomingEvent(
    meeting: MeetingResponse
  ): UpcomingEvent {
    const date = new Date(
      meeting.meetingDatetime
    );

    return {
      id: meeting.id,
      day: date
        .toLocaleDateString([], {
          weekday: 'short'
        })
        .toUpperCase(),
      date: date
        .getDate()
        .toString()
        .padStart(2, '0'),
      title: meeting.title,
      time: date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  private toTask(
    item: ActionItemResponse
  ): Task {
    return {
      id: item.id,
      title: item.description,
      meta: item.deadline
        ? `Due ${new Date(
            item.deadline
          ).toLocaleDateString()}`
        : 'No deadline',
      done: item.status === 'DONE',
      tag:
        item.proposedAssignee ||
        'Unassigned'
    };
  }

  private formatProcessingStatus(
    status: string
  ): MeetingProcessingStatusLabel {
    switch (status) {
      case 'DONE':
      case 'COMPLETED':
        return 'Processed';

      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'Processing';

      case 'FAILED':
        return 'Failed';

      default:
        return 'Not processed';
    }
  }
}