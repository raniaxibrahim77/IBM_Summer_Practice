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

    expect(element.querySelector('h1')?.textContent).toContain(
      'Welcome back!'
    );
  });
});