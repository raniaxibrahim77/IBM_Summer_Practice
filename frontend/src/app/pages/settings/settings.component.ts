import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppUserResponse, AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  currentUser: AppUserResponse | null = null;

  isEditingProfile = false;
  isSavingProfile = false;
  showSaveConfirmation = false;

  profileUsername = '';
  profileEmail = '';

  profileError = '';
  profileSuccess = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser =
      this.authService.getCurrentUser();

    this.resetProfileForm();
  }

  startProfileEdit(): void {
    this.profileError = '';
    this.profileSuccess = '';
    this.resetProfileForm();
    this.isEditingProfile = true;
  }

  cancelProfileEdit(): void {
    this.profileError = '';
    this.resetProfileForm();
    this.isEditingProfile = false;
  }

  saveProfile(): void {
    this.profileError = '';
    this.profileSuccess = '';

    if (!this.currentUser) {
      this.profileError =
        'No authenticated user was found.';
      return;
    }

    const username =
      this.profileUsername.trim();

    const email =
      this.profileEmail.trim();

    if (!username) {
      this.profileError =
        'Please enter a username.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.profileError =
        'Please enter a valid email address.';
      return;
    }

    if (this.isSavingProfile) {
      return;
    }

    this.showSaveConfirmation = true;

  }

  confirmProfileSave(): void {
    if (!this.currentUser || this.isSavingProfile) {
      return;
    }

    this.showSaveConfirmation = false;
    this.isSavingProfile = true;

    const username = this.profileUsername.trim();
    const email = this.profileEmail.trim();

    this.authService
      .updateProfile(this.currentUser.id, {
        username,
        email
      })
      .subscribe({
        next: (updatedUser) => {
          this.currentUser = updatedUser;
          this.isSavingProfile = false;
          this.isEditingProfile = false;
          this.profileSuccess =
            'Profile updated successfully.';
          this.resetProfileForm();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'Failed to update profile',
            error
          );

          this.isSavingProfile = false;
          this.profileError =
            error.error?.messages?.[0] ||
            error.error?.message ||
            'The profile could not be updated.';

          this.cdr.markForCheck();
        }
      });
  }

  cancelSaveConfirmation(): void {
    this.showSaveConfirmation = false;
  }

  get userInitials(): string {
    const username =
      this.currentUser?.username.trim();

    if (!username) {
      return 'G';
    }

    return username
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private resetProfileForm(): void {
    this.profileUsername =
      this.currentUser?.username ?? '';

    this.profileEmail =
      this.currentUser?.email ?? '';
  }

  private isValidEmail(
    email: string
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);
  }
}