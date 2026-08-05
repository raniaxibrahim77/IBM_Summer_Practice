import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { LogMeetingModal } from './log-meeting-modal';
import { AttendeeService } from '../../../../services/attendee.service';
import { AuthService } from '../../../../services/auth.service';
import { MeetingAiService } from '../../../../services/meeting-ai.service';
import { MeetingService } from '../../../../services/meeting.service';
import { TranscriptService } from '../../../../services/transcript.service';

describe('LogMeetingModal', () => {
  let component: LogMeetingModal;
  let fixture: ComponentFixture<LogMeetingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogMeetingModal],
      providers: [
        {
          provide: MeetingService,
          useValue: {
            createMeeting: () => of({}),
          },
        },
        {
          provide: MeetingAiService,
          useValue: {
            generateAiResult: () => of({}),
          },
        },
        {
          provide: TranscriptService,
          useValue: {
            createTranscript: () => of({}),
          },
        },
        {
          provide: AttendeeService,
          useValue: {
            getAttendees: () => of([]),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({
              id: 'user-1',
              username: 'Test User',
              email: 'test@example.com',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogMeetingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate an empty meeting name', () => {
    component.logMeeting();

    expect(component.logMeetingError).toBe(
      'Please enter a meeting name.',
    );
  });
});