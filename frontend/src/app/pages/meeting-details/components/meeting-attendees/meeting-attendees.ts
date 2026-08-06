import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AttendeeResponse,
  AttendeeService,
} from '../../../../services/attendee.service';

interface MeetingAttendee {
  id: string;
  name: string;
  email: string;
  roleInMeeting: string | null;
  initials: string;
  color: string;
}

const AVATAR_COLORS = [
  '#75C3D1',
  '#A33E43',
  '#8CA888',
  '#D9A24B',
];

@Component({
  selector: 'app-meeting-attendees',
  imports: [FormsModule],
  templateUrl: './meeting-attendees.html',
  styleUrl: './meeting-attendees.css',
})
export class MeetingAttendees implements OnChanges {
  @Input({ required: true }) meetingId = '';
  @Input() refreshKey = 0;

  attendees: MeetingAttendee[] = [];
  availableAttendees: AttendeeResponse[] = [];

  selectedAttendeeId = '';
  isOpen = false;

  constructor(
    private attendeeService: AttendeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(): void {
    if (!this.meetingId) {
      return;
    }

    this.loadAttendees();
    this.loadAvailableAttendees();
  }

  get unassignedAttendees(): AttendeeResponse[] {
    return this.availableAttendees.filter(
      (candidate) =>
        candidate.email &&
        !this.attendees.some(
          (assigned) => assigned.id === candidate.id,
        ),
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  removeAttendee(attendee: MeetingAttendee): void {
    this.attendeeService
      .removeMeetingAttendee(
        this.meetingId,
        attendee.id,
      )
      .subscribe({
        next: () => {
          this.attendees = this.attendees.filter(
            (item) => item.id !== attendee.id,
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to remove attendee from meeting',
            error,
          );

          alert(
            'Failed to remove attendee from the meeting.',
          );
        },
      });
  }

  addAttendee(): void {
    if (!this.selectedAttendeeId) {
      return;
    }

    const attendee = this.availableAttendees.find(
      (item) => item.id === this.selectedAttendeeId,
    );

    if (!attendee) {
      alert(
        'The selected attendee could not be found.',
      );
      return;
    }

    this.attendeeService
      .addMeetingAttendee(this.meetingId, {
        attendeeId: attendee.id,
        roleInMeeting: null,
      })
      .subscribe({
        next: (addedAttendee) => {
          this.attendees.push(
            this.toAttendeeView(
              addedAttendee,
              this.attendees.length,
            ),
          );

          this.selectedAttendeeId = '';
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to add attendee to meeting',
            error,
          );

          alert(
            'Failed to add attendee to the meeting.',
          );
        },
      });
  }

  private loadAttendees(): void {
    this.attendeeService
      .getMeetingAttendees(this.meetingId)
      .subscribe({
        next: (attendees) => {
          this.attendees = attendees.map(
            (attendee, index) =>
              this.toAttendeeView(attendee, index),
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to load meeting attendees',
            error,
          );

          this.attendees = [];
          this.cdr.markForCheck();
        },
      });
  }

  private loadAvailableAttendees(): void {
    this.attendeeService
      .getAttendees()
      .subscribe({
        next: (attendees) => {
          this.availableAttendees = attendees;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to load available attendees',
            error,
          );
        },
      });
  }

  private toAttendeeView(
    attendee: AttendeeResponse,
    index: number,
  ): MeetingAttendee {
    const initials = attendee.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase(),
      )
      .join('');

    return {
      id: attendee.id,
      name: attendee.name,
      email: attendee.email ?? '',
      roleInMeeting: attendee.roleInMeeting,
      initials,
      color:
        AVATAR_COLORS[
          index % AVATAR_COLORS.length
        ],
    };
  }
}