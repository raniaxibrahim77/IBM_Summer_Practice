import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActionItemResponse } from './action-item.service';

export interface AiResultResponse {
  id: string;
  conciseSummary: string | null;
  detailedSummary: string | null;
  keyPoints: string | null;
  decisions: string | null;
  followUpNotes: string | null;
  status: string;
  generatedAt: string;
  actionItems: ActionItemResponse[];
}

export interface AskMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface AskRequest {
  question: string;
  previousMessages: AskMessage[];
}

export interface AskResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class MeetingAiService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  generateAiResult(
    meetingId: string
  ): Observable<AiResultResponse> {
    return this.http.post<AiResultResponse>(
      `${this.apiUrl}/meetings/${meetingId}/generate-ai-result`,
      {}
    );
  }

  askMeeting(
    meetingId: string,
    request: AskRequest
  ): Observable<AskResponse> {
    return this.http.post<AskResponse>(
      `${this.apiUrl}/meetings/${meetingId}/ask`,
      request
    );
  }
}