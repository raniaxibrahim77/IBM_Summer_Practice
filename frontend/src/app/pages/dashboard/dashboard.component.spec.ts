import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../services/dashboard.service';
import { MeetingService } from '../../services/meeting.service';
import { AttendeeService } from '../../services/attendee.service';
import { AuthService } from '../../services/auth.service';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            loadMeetingOverview: () =>
              of({
                meetings: [],
                recentMeetings: [],
                upcomingEvents: [],
              }),
            loadTasks: () => of([]),
            buildCalendar: () => [],
          },
        },
        {
          provide: MeetingService,
          useValue: {
            createMeeting: () => of({}),
          },
        },
        {
          provide: AttendeeService,
          useValue: {
            getAttendees: () => of([]),
            createAttendee: () => of({}),
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
  });

  it('should create the dashboard', () => {
    const fixture = TestBed.createComponent(DashboardComponent);

    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the dashboard heading', () => {
    const fixture = TestBed.createComponent(DashboardComponent);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Welcome back!');
  });

  it('should open the create meeting modal', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('New Meeting'),
    );

    expect(openButton).toBeTruthy();

    openButton!.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should validate an empty meeting form', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const openButton = Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('New Meeting'),
    );

    openButton!.click();
    fixture.detectChanges();

    const createButton = Array.from(element.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Create Meeting',
    );

    expect(createButton).toBeTruthy();

    createButton!.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Please enter a meeting name.',
    );
  });
});
