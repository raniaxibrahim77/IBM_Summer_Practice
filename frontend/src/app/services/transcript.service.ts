import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TranscriptResponse {
  id: string;
  meetingId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptCreateRequest {
  content: string;
}

@Injectable({ providedIn: 'root' })
export class TranscriptService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getTranscript(meetingId: string): Observable<TranscriptResponse> {
    return this.http.get<TranscriptResponse>(`${this.apiUrl}/meetings/${meetingId}/transcript`);
  }

  createTranscript(meetingId: string, content: string): Observable<TranscriptResponse> {
    return this.http.post<TranscriptResponse>(
      `${this.apiUrl}/meetings/${meetingId}/transcript`,
      { content }
    );
  }

  updateTranscript(meetingId: string, content: string): Observable<TranscriptResponse> {
    return this.http.put<TranscriptResponse>(
      `${this.apiUrl}/meetings/${meetingId}/transcript`,
      { content }
    );
  }
}