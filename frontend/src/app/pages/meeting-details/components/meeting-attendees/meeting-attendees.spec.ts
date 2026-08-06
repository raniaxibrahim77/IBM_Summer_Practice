import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AttendeeService } from '../../../../services/attendee.service';
import { MeetingAttendees } from './meeting-attendees';

describe('MeetingAttendees', () => {
  let component: MeetingAttendees;
  let fixture: ComponentFixture<MeetingAttendees>;

  const attendee = {
    id: 'attendee-1',
    name: 'Test Person',
    email: 'test@example.com',
    roleInMeeting: null,
  };

  const attendeeServiceMock = {
    getMeetingAttendees: vi.fn(),
    getAttendees: vi.fn(),
    addMeetingAttendee: vi.fn(),
    removeMeetingAttendee: vi.fn(),
  };

  beforeEach(async () => {
    attendeeServiceMock.getMeetingAttendees
      .mockReturnValue(of([]));

    attendeeServiceMock.getAttendees
      .mockReturnValue(of([attendee]));

    attendeeServiceMock.addMeetingAttendee
      .mockReturnValue(of(attendee));

    attendeeServiceMock.removeMeetingAttendee
      .mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [MeetingAttendees],
      providers: [
        {
          provide: AttendeeService,
          useValue: attendeeServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      MeetingAttendees,
    );

    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'meetingId',
      'meeting-1',
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create and load attendees', () => {
    expect(component).toBeTruthy();

    expect(
      attendeeServiceMock.getMeetingAttendees,
    ).toHaveBeenCalledWith('meeting-1');

    expect(
      attendeeServiceMock.getAttendees,
    ).toHaveBeenCalled();
  });

  it('should add an attendee', () => {
    component.selectedAttendeeId = 'attendee-1';

    component.addAttendee();

    expect(
      attendeeServiceMock.addMeetingAttendee,
    ).toHaveBeenCalledWith('meeting-1', {
      attendeeId: 'attendee-1',
      roleInMeeting: null,
    });

    expect(component.attendees).toHaveLength(1);
  });

  it('should remove an attendee', () => {
    component.attendees = [
      {
        ...attendee,
        initials: 'TP',
        color: '#75C3D1',
      },
    ];

    component.removeAttendee(
      component.attendees[0],
    );

    expect(
      attendeeServiceMock.removeMeetingAttendee,
    ).toHaveBeenCalledWith(
      'meeting-1',
      'attendee-1',
    );

    expect(component.attendees).toHaveLength(0);
  });
});