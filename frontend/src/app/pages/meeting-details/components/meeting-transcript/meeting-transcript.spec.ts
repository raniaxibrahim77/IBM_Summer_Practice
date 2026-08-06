import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TranscriptService } from '../../../../services/transcript.service';
import { MeetingTranscript } from './meeting-transcript';

describe('MeetingTranscript', () => {
  let component: MeetingTranscript;
  let fixture: ComponentFixture<MeetingTranscript>;

  const transcriptServiceMock = {
    getTranscript: vi.fn(),
    createTranscript: vi.fn(),
  };

  beforeEach(async () => {
    transcriptServiceMock.getTranscript.mockReturnValue(
      of({
        content: 'Existing transcript',
      }),
    );

    transcriptServiceMock.createTranscript.mockReturnValue(
      of({}),
    );

    await TestBed.configureTestingModule({
      imports: [MeetingTranscript],
      providers: [
        {
          provide: TranscriptService,
          useValue: transcriptServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(
      MeetingTranscript,
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

  it('should create and load the transcript', () => {
    expect(component).toBeTruthy();

    expect(
      transcriptServiceMock.getTranscript,
    ).toHaveBeenCalledWith('meeting-1');

    expect(component.transcriptText).toBe(
      'Existing transcript',
    );
  });

  it('should reject a non-text file', () => {
    const file = new File(
      ['image'],
      'image.png',
      { type: 'image/png' },
    );

    component.onTranscriptSelected({
      target: {
        files: [file],
        value: 'image.png',
      },
    } as unknown as Event);

    expect(component.uploadError).toBe(
      'Please select a .txt file.',
    );

    expect(
      transcriptServiceMock.createTranscript,
    ).not.toHaveBeenCalled();
  });

  it('should upload a text transcript', async () => {
    const file = new File(
      ['New transcript'],
      'transcript.txt',
      { type: 'text/plain' },
    );

    Object.defineProperty(file, 'text', {
      value: vi.fn().mockResolvedValue(
        'New transcript',
      ),
    });

    component.onTranscriptSelected({
      target: {
        files: [file],
        value: 'transcript.txt',
      },
    } as unknown as Event);

    await vi.waitFor(() => {
      expect(
        transcriptServiceMock.createTranscript,
      ).toHaveBeenCalledWith(
        'meeting-1',
        'New transcript',
      );
    });

    expect(component.transcriptText).toBe(
      'New transcript',
    );

    expect(component.isUploading).toBe(false);
  });
});