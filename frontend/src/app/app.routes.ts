import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { MeetingsComponent } from './pages/meetings/meetings.component';
import { MeetingDetailsComponent } from './pages/meeting-details/meeting-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'meetings', component: MeetingsComponent },
  { path: 'meeting-details/:id', component: MeetingDetailsComponent },
];