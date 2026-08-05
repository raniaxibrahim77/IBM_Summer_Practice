import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DeleteTranscriptConfirmation } from './delete-transcript-confirmation';
import { TranscriptService } from '../../../../services/transcript.service';

describe('DeleteTranscriptConfirmation', () => {
  let component: DeleteTranscriptConfirmation;
  let fixture: ComponentFixture<DeleteTranscriptConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTranscriptConfirmation],
      providers: [
        {
          provide: TranscriptService,
          useValue: {
            deleteTranscript: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteTranscriptConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit when deletion succeeds', () => {
    let deletionEmitted = false;

    component.meetingId = 'meeting-1';
    component.transcriptDeleted.subscribe(() => {
      deletionEmitted = true;
    });

    component.confirmDelete();

    expect(deletionEmitted).toBe(true);
  });

  it('should emit when cancelled', () => {
    let cancellationEmitted = false;

    component.cancelled.subscribe(() => {
      cancellationEmitted = true;
    });

    component.cancel();

    expect(cancellationEmitted).toBe(true);
  });
});