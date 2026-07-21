import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ActionItemResponse {
  id: string;
  description: string;
  proposedAssignee: string | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  aiResultId: string | null;
}

@Injectable({ providedIn: 'root' })
export class ActionItemService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getActionItems(): Observable<ActionItemResponse[]> {
    return this.http.get<ActionItemResponse[]>(`${this.apiUrl}/action-items`);
  }

  updateStatus(id: string, status: string): Observable<ActionItemResponse> {
    return this.http.patch<ActionItemResponse>(`${this.apiUrl}/action-items/${id}/status`, { status });
  }
}