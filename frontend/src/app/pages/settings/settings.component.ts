import { Component, OnInit } from '@angular/core';

import { AppUserResponse, AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ProfileSettings } from './components/profile-settings/profile-settings';
import { SecuritySettings } from './components/security-settings/security-settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ProfileSettings,
    SecuritySettings
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  currentUser: AppUserResponse | null = null;

  constructor(
    private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser =
      this.authService.getCurrentUser();
  }

  handleUserUpdated(updatedUser: AppUserResponse): void {
    this.currentUser = updatedUser;
  }
}