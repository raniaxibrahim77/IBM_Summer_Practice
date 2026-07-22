import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendeeResponse {
  id: string;
  name: string;
  email: string | null;
  roleInMeeting: string | null;
}

export interface AttendeeCreateRequest {
  name: string;
  email: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAttendees(): Observable<AttendeeResponse[]> {
    return this.http.get<AttendeeResponse[]>(
      `${this.apiUrl}/attendees`
    );
  }

  createAttendee(
    request: AttendeeCreateRequest
  ): Observable<AttendeeResponse> {
    return this.http.post<AttendeeResponse>(
      `${this.apiUrl}/attendees`,
      request
    );
  }
}