import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';

import { MeetingDetailsComponent } from './meeting-details.component';
import { MeetingService } from '../../services/meeting.service';
import { TranscriptService } from '../../services/transcript.service';
import { AttendeeService } from '../../services/attendee.service';
import { MeetingAiService } from '../../services/meeting-ai.service';
import { ActionItemService } from '../../services/action-item.service';
import { AuthService } from '../../services/auth.service';

describe('MeetingDetailsComponent', () => {
  let fixture: ComponentFixture<MeetingDetailsComponent>;
  let component: MeetingDetailsComponent;

  const meetingServiceMock = {
    getMeeting: () =>
      of({
        id: 'meeting-1',
        title: 'Test Meeting',
        description: '',
        meetingDatetime: '2026-08-06T10:00:00',
        processingStatus: 'COMPLETED',
        createdAt: '2026-08-01T10:00:00',
        updatedAt: '2026-08-06T10:00:00',
        ownerId: 'user-1',
        attendeeCount: 0,
        hasTranscript: true,
      }),
    deleteMeeting: () => of(void 0),
  };

  const transcriptServiceMock = {
    getTranscript: () =>
      of({
        content: '',
      }),
    createTranscript: () => of({}),
  };

  const attendeeServiceMock = {
    getMeetingAttendees: () => of([]),
    getAttendees: () => of([]),
    addMeetingAttendee: () => of({}),
    removeMeetingAttendee: () => of(void 0),
  };

  const meetingAiServiceMock = {
    getLatestAiResult: () =>
      of({
        id: 'result-1',
        conciseSummary: 'Test summary',
        detailedSummary: null,
        keyPoints: null,
        decisions: null,
        followUpNotes: null,
        status: 'COMPLETED',
        generatedAt: '2026-08-06T10:00:00',
        actionItems: [],
      }),
    generateAiResult: () => of({}),
    askMeeting: () =>
      of({
        answer: 'Test answer',
      }),
  };

  const actionItemServiceMock = {
    updateStatus: () => of({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(
              convertToParamMap({
                id: 'meeting-1',
              }),
            ),
          },
        },
        {
          provide: MeetingService,
          useValue: meetingServiceMock,
        },
        {
          provide: TranscriptService,
          useValue: transcriptServiceMock,
        },
        {
          provide: AttendeeService,
          useValue: attendeeServiceMock,
        },
        {
          provide: MeetingAiService,
          useValue: meetingAiServiceMock,
        },
        {
          provide: ActionItemService,
          useValue: actionItemServiceMock,
        },
        {
          provide: AuthService,
          useValue: {
            logout: () => {},
            getCurrentUser: () => ({
              id: 'user-1',
              username: 'Test User',
              email: 'test@example.com',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      MeetingDetailsComponent,
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load the meeting', () => {
    expect(component).toBeTruthy();
    expect(component.meetingId).toBe('meeting-1');
    expect(component.title).toBe('Test Meeting');
    expect(component.status).toBe('Processed');
  });

  it('should render the extracted components', () => {
    const element =
      fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector(
        'app-meeting-attendees',
      ),
    ).toBeTruthy();

    expect(
      element.querySelector(
        'app-meeting-assistant',
      ),
    ).toBeTruthy();

    expect(
      element.querySelector(
        'app-meeting-transcript',
      ),
    ).toBeTruthy();

    expect(
      element.querySelector(
        'app-meeting-summary',
      ),
    ).toBeTruthy();
  });

  it('should open the delete confirmation', () => {
    const element =
      fixture.nativeElement as HTMLElement;

    const deleteButton =
      element.querySelector<HTMLButtonElement>(
        '.delete-meeting-button',
      );

    expect(deleteButton).toBeTruthy();

    deleteButton!.click();
    fixture.detectChanges();

    expect(
      element.querySelector(
        'app-delete-meeting-confirmation',
      ),
    ).toBeTruthy();
  });

  it('should refresh attendees when requested', () => {
    expect(component.attendeesRefreshKey).toBe(0);

    component.refreshAttendees();

    expect(component.attendeesRefreshKey).toBe(1);
  });
});