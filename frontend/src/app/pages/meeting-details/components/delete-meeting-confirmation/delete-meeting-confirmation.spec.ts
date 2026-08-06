import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MeetingService } from '../../../../services/meeting.service';
import { DeleteMeetingConfirmation } from './delete-meeting-confirmation';

describe('DeleteMeetingConfirmation', () => {
  let component: DeleteMeetingConfirmation;
  let fixture: ComponentFixture<DeleteMeetingConfirmation>;

  const meetingServiceMock = {
    deleteMeeting: vi.fn(),
  };

  beforeEach(async () => {
    meetingServiceMock.deleteMeeting.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [DeleteMeetingConfirmation],
      providers: [
        {
          provide: MeetingService,
          useValue: meetingServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      DeleteMeetingConfirmation,
    );

    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'meetingId',
      'meeting-1',
    );

    fixture.componentRef.setInput(
      'meetingTitle',
      'Test Meeting',
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancelled when cancel is selected', () => {
    const cancelled = vi.fn();

    component.cancelled.subscribe(cancelled);
    component.cancel();

    expect(cancelled).toHaveBeenCalled();
  });

  it('should delete the meeting and emit meetingDeleted', () => {
    const meetingDeleted = vi.fn();

    component.meetingDeleted.subscribe(meetingDeleted);
    component.confirmDelete();

    expect(
      meetingServiceMock.deleteMeeting,
    ).toHaveBeenCalledWith('meeting-1');

    expect(meetingDeleted).toHaveBeenCalled();
    expect(component.isDeleting).toBe(false);
  });
});