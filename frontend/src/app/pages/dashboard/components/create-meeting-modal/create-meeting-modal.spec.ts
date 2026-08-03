import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CreateMeetingModal } from './create-meeting-modal';
import { AttendeeService } from '../../../../services/attendee.service';
import { MeetingService } from '../../../../services/meeting.service';
import { AuthService } from '../../../../services/auth.service';

describe('CreateMeetingModal', () => {
  let component: CreateMeetingModal;
  let fixture: ComponentFixture<CreateMeetingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMeetingModal],
      providers: [
        {
          provide: AttendeeService,
          useValue: {
            getAttendees: () => of([]),
            createAttendee: () =>
              of({
                id: 'attendee-1',
                name: 'Test Attendee',
                email: null,
              }),
          },
        },
        {
          provide: MeetingService,
          useValue: {
            createMeeting: () => of({}),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateMeetingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});