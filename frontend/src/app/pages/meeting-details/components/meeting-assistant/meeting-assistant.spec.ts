import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { MeetingAiService } from '../../../../services/meeting-ai.service';
import { MeetingAssistant } from './meeting-assistant';

describe('MeetingAssistant', () => {
  let component: MeetingAssistant;
  let fixture: ComponentFixture<MeetingAssistant>;

  const meetingAiServiceMock = {
    askMeeting: vi.fn(),
  };

  beforeEach(async () => {
    meetingAiServiceMock.askMeeting.mockReturnValue(
      of({
        answer: 'AI response',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [MeetingAssistant],
      providers: [
        {
          provide: MeetingAiService,
          useValue: meetingAiServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      MeetingAssistant,
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send a message and display the response', () => {
    component.chatInput = 'What happened?';

    component.sendMessage();

    expect(
      meetingAiServiceMock.askMeeting,
    ).toHaveBeenCalledWith(
      'meeting-1',
      {
        question: 'What happened?',
        previousMessages: [
          {
            role: 'assistant',
            text:
              "Hi, I've read through this meeting. " +
              'Want a summary, key risks, or the action items again?',
          },
        ],
      },
    );

    expect(component.chatMessages.at(-1)).toEqual({
      from: 'assistant',
      text: 'AI response',
    });

    expect(component.isSendingMessage).toBe(false);
  });

  it('should run the risks quick action', () => {
    component.runQuickAction('risks');

    expect(
      meetingAiServiceMock.askMeeting,
    ).toHaveBeenCalledWith(
      'meeting-1',
      expect.objectContaining({
        question: 'What are the key risks?',
      }),
    );
  });
});