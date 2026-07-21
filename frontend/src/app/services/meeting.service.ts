import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MeetingResponse {
  id: string;
  title: string;
  description: string;
  meetingDatetime: string;
  processingStatus: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
}

export interface MeetingCreateRequest {
  title: string;
  description: string;
  meetingDatetime: string;
  ownerId: string | null;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getMeetings(): Observable<MeetingResponse[]> {
    return this.http.get<MeetingResponse[]>(`${this.apiUrl}/meetings`);
  }

  createMeeting(
    request: MeetingCreateRequest
  ): Observable<MeetingResponse> {
    return this.http.post<MeetingResponse>(
      `${this.apiUrl}/meetings`,
      request
    );
  }
}