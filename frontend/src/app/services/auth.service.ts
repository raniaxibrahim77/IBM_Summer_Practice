import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AppUserResponse {
  id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private storageKey = 'currentUser';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<AppUserResponse> {
    return this.http
      .post<AppUserResponse>(`${this.apiUrl}/auth/login`, request)
      .pipe(tap((user) => this.setCurrentUser(user)));
  }

  register(request: RegisterRequest): Observable<AppUserResponse> {
    return this.http
      .post<AppUserResponse>(`${this.apiUrl}/auth/register`, request)
      .pipe(tap((user) => this.setCurrentUser(user)));
  }

  getCurrentUser(): AppUserResponse | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  private setCurrentUser(user: AppUserResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }
}