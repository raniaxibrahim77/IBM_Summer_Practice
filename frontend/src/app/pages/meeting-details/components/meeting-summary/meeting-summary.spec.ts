import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ActionItemService } from '../../../../services/action-item.service';
import { MeetingAiService } from '../../../../services/meeting-ai.service';
import { MeetingSummary } from './meeting-summary';

describe('MeetingSummary', () => {
  let component: MeetingSummary;
  let fixture: ComponentFixture<MeetingSummary>;

  const aiResult = {
    id: 'result-1',
    conciseSummary: 'Test summary',
    detailedSummary: null,
    keyPoints: null,
    decisions: null,
    followUpNotes: null,
    status: 'COMPLETED',
    generatedAt: '2026-08-06T10:00:00',
    actionItems: [
      {
        id: 'action-1',
        description: 'Complete the report',
        status: 'OPEN',
        deadline: null,
        proposedAssignee: null,
      },
    ],
  };

  const meetingAiServiceMock = {
    getLatestAiResult: vi.fn(),
    generateAiResult: vi.fn(),
  };

  const actionItemServiceMock = {
    updateStatus: vi.fn(),
  };

  beforeEach(async () => {
    meetingAiServiceMock.getLatestAiResult
      .mockReturnValue(of(aiResult));

    meetingAiServiceMock.generateAiResult
      .mockReturnValue(of(aiResult));

    actionItemServiceMock.updateStatus
      .mockReturnValue(
        of({
          ...aiResult.actionItems[0],
          status: 'DONE',
        }),
      );

    await TestBed.configureTestingModule({
      imports: [MeetingSummary],
      providers: [
        {
          provide: MeetingAiService,
          useValue: meetingAiServiceMock,
        },
        {
          provide: ActionItemService,
          useValue: actionItemServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      MeetingSummary,
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

    fixture.componentRef.setInput(
      'meetingDate',
      'Aug 6, 2026 · 10:00 AM',
    );

    fixture.componentRef.setInput(
      'transcriptText',
      'Test transcript',
    );

    fixture.componentRef.setInput(
      'status',
      'Not processed',
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create and load the AI result', () => {
    expect(component).toBeTruthy();

    expect(
      meetingAiServiceMock.getLatestAiResult,
    ).toHaveBeenCalledWith('meeting-1');

    expect(component.aiSummary).toBe(
      'Test summary',
    );

    expect(component.actionItems).toHaveLength(1);
  });

  it('should generate a summary and request attendee refresh', () => {
    const statuses: string[] = [];
    const refreshRequested = vi.fn();

    component.statusChange.subscribe(
      (status) => statuses.push(status),
    );

    component.attendeesRefreshRequested.subscribe(
      refreshRequested,
    );

    component.regenerateSummary();

    expect(
      meetingAiServiceMock.generateAiResult,
    ).toHaveBeenCalledWith('meeting-1');

    expect(statuses).toEqual([
      'Processing',
      'Processed',
    ]);

    expect(refreshRequested).toHaveBeenCalled();
    expect(component.isGenerating).toBe(false);
  });

  it('should update an action item', () => {
    const item = component.actionItems[0];

    component.toggleActionItem(item);

    expect(
      actionItemServiceMock.updateStatus,
    ).toHaveBeenCalledWith(
      'action-1',
      'DONE',
    );

    expect(item.done).toBe(true);
    expect(item.isUpdating).toBe(false);
  });
});