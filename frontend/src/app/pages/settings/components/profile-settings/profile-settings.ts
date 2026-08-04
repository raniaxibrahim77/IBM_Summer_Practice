import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppUserResponse, AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  imports: [FormsModule],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings implements OnChanges {
  @Input() user: AppUserResponse | null = null;
  @Output() userUpdated = new EventEmitter<AppUserResponse>();

  constructor(private authService: AuthService) {}

  isEditing = false;
  isSaving = false;
  showSaveConfirmation = false;

  username = '';
  email = '';

  errorMessage = '';
  successMessage = '';

  ngOnChanges(): void {
    if (!this.isEditing) {
      this.resetForm();
    }
  }

  get userInitials(): string {
    const username = this.user?.username.trim();

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

  startEdit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm();
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.errorMessage = '';
    this.resetForm();
    this.isEditing = false;
  }

  requestSave(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user) {
      this.errorMessage = 'No authenticated user was found.';
      return;
    }

    const username = this.username.trim();
    const email = this.email.trim();

    if (!username) {
      this.errorMessage = 'Please enter a username.';
      return;
    }

    if (!this.isValidEmail(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.isSaving) {
      return;
    }

    this.showSaveConfirmation = true;
  }

  confirmSave(): void {
    if (!this.user || this.isSaving) {
      return;
    }

    this.showSaveConfirmation = false;
    this.isSaving = true;

    const username = this.username.trim();
    const email = this.email.trim();

    this.authService
      .updateProfile(this.user.id, {
        username,
        email,
      })
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isSaving = false;
          this.isEditing = false;
          this.successMessage = 'Profile updated successfully.';
          this.resetForm();
          this.userUpdated.emit(updatedUser);
        },
        error: (error) => {
          console.error('Failed to update profile', error);

          this.isSaving = false;
          this.errorMessage =
            error.error?.messages?.[0] ||
            error.error?.message ||
            'The profile could not be updated.';
        },
      });
  }

  cancelSaveConfirmation(): void {
    this.showSaveConfirmation = false;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private resetForm(): void {
    this.username = this.user?.username ?? '';
    this.email = this.user?.email ?? '';
  }
}