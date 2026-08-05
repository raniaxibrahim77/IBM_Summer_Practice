import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { MeetingsComponent } from './meetings.component';
import { MeetingService } from '../../services/meeting.service';
import { MeetingAiService } from '../../services/meeting-ai.service';
import { TranscriptService } from '../../services/transcript.service';
import { AttendeeService } from '../../services/attendee.service';
import { AuthService } from '../../services/auth.service';

describe('MeetingsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingsComponent],
      providers: [
        provideRouter([]),
        {
          provide: MeetingService,
          useValue: {
            getMeetings: () => of([]),
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
            updateTranscript: () => of({}),
            deleteTranscript: () => of({}),
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
            logout: () => {},
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the meetings page', () => {
    const fixture = TestBed.createComponent(MeetingsComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the meetings heading', () => {
    const fixture = TestBed.createComponent(MeetingsComponent);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Meetings');
  });

  it('should open the log meeting modal', () => {
    const fixture = TestBed.createComponent(MeetingsComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Log Meeting'),
    );

    expect(openButton).toBeTruthy();

    openButton!.click();
    fixture.detectChanges();

    expect(element.querySelector('.modal')).toBeTruthy();
  });

  it('should validate an empty meeting name', () => {
    const fixture = TestBed.createComponent(MeetingsComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Log Meeting'),
    );

    openButton!.click();
    fixture.detectChanges();

    const logButton = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Log a Meeting',
    );

    expect(logButton).toBeTruthy();

    logButton!.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Please enter a meeting name.',
    );
  });

  it('should open the delete transcript confirmation', () => {
    const fixture = TestBed.createComponent(MeetingsComponent);
    fixture.detectChanges();

    fixture.componentInstance.openDeleteTranscriptConfirmation(
      {
        id: 'meeting-1',
        title: 'Test Meeting',
        dateTime: 'Aug 5, 2026',
        attendees: 1,
        hasTranscript: true,
      },
      new Event('click'),
    );

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('[role="dialog"]');

    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain('Delete transcript?');
    expect(dialog?.textContent).toContain('Test Meeting');
  });
});
