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
  attendeeCount: number;
}

export interface MeetingCreateRequest {
  title: string;
  description: string;
  meetingDatetime: string;
  ownerId: string | null;
  attendeeIds: string[];
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getMeetings(ownerId?: string): Observable<MeetingResponse[]> {
    const params: Record<string, string> = ownerId ? { ownerId } : {};
    return this.http.get<MeetingResponse[]>(`${this.apiUrl}/meetings`, { params });
  }

  getMeeting(id: string): Observable<MeetingResponse> {
  return this.http.get<MeetingResponse>(`${this.apiUrl}/meetings/${id}`);
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