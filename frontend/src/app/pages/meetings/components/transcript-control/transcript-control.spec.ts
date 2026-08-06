import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { TranscriptService } from '../../../../services/transcript.service';
import { TranscriptControl } from './transcript-control';

describe('TranscriptControl', () => {
  let component: TranscriptControl;
  let fixture: ComponentFixture<TranscriptControl>;

  const transcriptServiceMock = {
    createTranscript: vi.fn(),
    updateTranscript: vi.fn(),
    deleteTranscript: vi.fn(),
  };

  beforeEach(async () => {
    transcriptServiceMock.createTranscript.mockReturnValue(of({}));
    transcriptServiceMock.updateTranscript.mockReturnValue(of({}));
    transcriptServiceMock.deleteTranscript.mockReturnValue(of({}));

    vi.stubGlobal(
      'FileReader',
      class {
        result = 'Test transcript content';
        onload: (() => void) | null = null;

        readAsText(): void {
          this.onload?.();
        }
      },
    );

    await TestBed.configureTestingModule({
      imports: [TranscriptControl],
      providers: [
        {
          provide: TranscriptService,
          useValue: transcriptServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TranscriptControl);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('meetingId', 'meeting-1');
    fixture.componentRef.setInput('meetingTitle', 'Test Meeting');
    fixture.componentRef.setInput('hasTranscript', false);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a transcript from a text file', () => {
    const file = new File(
      ['Test transcript content'],
      'transcript.txt',
      { type: 'text/plain' },
    );

    component.onFileSelected({
      target: {
        files: [file],
        value: 'transcript.txt',
      },
    } as unknown as Event);

    expect(
      transcriptServiceMock.createTranscript,
    ).toHaveBeenCalledWith(
      'meeting-1',
      'Test transcript content',
    );

    expect(component.hasTranscript).toBe(true);
    expect(component.message).toContain('Transcript added');
  });

  it('should update the transcript when one already exists', () => {
    transcriptServiceMock.createTranscript.mockReturnValue(
      throwError(() => ({ status: 409 })),
    );

    const file = new File(
      ['Updated transcript'],
      'transcript.txt',
      { type: 'text/plain' },
    );

    component.onFileSelected({
      target: {
        files: [file],
        value: 'transcript.txt',
      },
    } as unknown as Event);

    expect(
      transcriptServiceMock.updateTranscript,
    ).toHaveBeenCalledWith(
      'meeting-1',
      'Test transcript content',
    );

    expect(component.message).toContain('Transcript updated');
  });

  it('should emit false after transcript deletion', () => {
    const emittedValues: boolean[] = [];

    component.hasTranscriptChange.subscribe((value) => {
      emittedValues.push(value);
    });

    component.handleTranscriptDeleted();

    expect(emittedValues).toEqual([false]);
    expect(component.hasTranscript).toBe(false);
  });
});