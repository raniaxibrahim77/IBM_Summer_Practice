import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AttendeeResponse, AttendeeService, } from '../../../../services/attendee.service';
import { MeetingCreateRequest, MeetingService, } from '../../../../services/meeting.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-create-meeting-modal',
  imports: [FormsModule],
  templateUrl: './create-meeting-modal.html',
  styleUrl: './create-meeting-modal.css',
})
export class CreateMeetingModal implements OnInit {
  @Output() cancelled = new EventEmitter<void>();
  @Output() meetingCreated = new EventEmitter<number>();

  constructor(
    private attendeeService: AttendeeService,
    private meetingService: MeetingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAttendees();
  }

  private readonly today = new Date();

  readonly minimumMeetingDate =
    `${this.today.getFullYear()}-` +
    `${(this.today.getMonth() + 1).toString().padStart(2, '0')}-` +
    `${this.today.getDate().toString().padStart(2, '0')}`;

  attendees: AttendeeResponse[] = [];
  invitedPeople: AttendeeResponse[] = [];

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

  get peopleSuggestions(): AttendeeResponse[] {
    if (!this.peopleSearchFocused) {
      return [];
    }

    const term = this.peopleSearch.trim().toLowerCase();

    const availableAttendees = this.attendees.filter(
      (attendee) => !this.invitedPeople.some((invited) => invited.id === attendee.id),
    );

    if (!term) {
      return availableAttendees.slice(0, 5);
    }

    return availableAttendees
      .filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(term) ||
          (attendee.email?.toLowerCase().includes(term) ?? false),
      )
      .slice(0, 5);
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
    const alreadyInvited = this.invitedPeople.some((invited) => invited.id === attendee.id);

    if (!alreadyInvited) {
      this.invitedPeople = [...this.invitedPeople, attendee];
    }

    this.peopleSearch = '';
    this.peopleSearchFocused = false;
  }

  removePerson(attendeeId: string): void {
    this.invitedPeople = this.invitedPeople.filter((attendee) => attendee.id !== attendeeId);
  }

  cancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  createAttendee(): void {
    this.createAttendeeError = '';

    const name = this.newAttendeeName.trim();
    const email = this.newAttendeeEmail.trim();

    if (!name) {
      this.createAttendeeError = 'Please enter the attendee name.';
      return;
    }

    if (this.isCreatingAttendee) {
      return;
    }

    this.isCreatingAttendee = true;

    this.attendeeService
      .createAttendee({
        name,
        email: email || null,
      })
      .subscribe({
        next: (createdAttendee) => {
          this.attendees = [...this.attendees, createdAttendee];
          this.invitedPeople = [...this.invitedPeople, createdAttendee];

          this.peopleSearch = '';
          this.closeAddAttendeeForm();
        },
        error: (error) => {
          console.error('Failed to create attendee', error);

          this.isCreatingAttendee = false;
          this.createAttendeeError =
            error.error?.message || 'The attendee could not be created.';
        },
      });
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
      this.createMeetingError = 'Please select a future date and time.';
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
      attendeeIds: this.invitedPeople.map((attendee) => attendee.id),
    };

    this.isCreatingMeeting = true;

    this.meetingService.createMeeting(request).subscribe({
      next: () => {
        const attendeeCount = this.invitedPeople.length;

        this.isCreatingMeeting = false;
        this.resetForm();
        this.meetingCreated.emit(attendeeCount);
      },
      error: (error) => {
        console.error('Failed to create meeting', error);

        this.isCreatingMeeting = false;
        this.createMeetingError =
          error.error?.message ||
          'The meeting could not be created. Please try again.';
      },
    });
  }

  private loadAttendees(): void {
    this.isLoadingAttendees = true;
    this.attendeeLoadError = '';

    this.attendeeService.getAttendees().subscribe({
      next: (attendees) => {
        this.attendees = attendees;
        this.isLoadingAttendees = false;
      },
      error: (error) => {
        console.error('Failed to load attendees', error);
        this.isLoadingAttendees = false;
        this.attendeeLoadError =
          'Attendees could not be loaded. Please try again.';
      },
    });
  }

  private resetForm(): void {
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
}
