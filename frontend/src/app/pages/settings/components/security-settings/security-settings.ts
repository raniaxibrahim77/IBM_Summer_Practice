import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AppUserResponse,
  AuthService,
} from '../../../../services/auth.service';

@Component({
  selector: 'app-security-settings',
  imports: [FormsModule],
  templateUrl: './security-settings.html',
  styleUrl: './security-settings.css',
})
export class SecuritySettings {
  @Input() user: AppUserResponse | null = null;
  @Output() userUpdated = new EventEmitter<AppUserResponse>();

  isEditing = false;
  isSaving = false;

  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService) {}

  startEdit(): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.isSaving) {
      return;
    }

    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.isEditing = false;
  }

  savePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.user) {
      this.errorMessage = 'No authenticated user was found.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage =
        'Password must contain at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'The passwords do not match.';
      return;
    }

    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    this.authService
      .updateProfile(this.user.id, {
        username: this.user.username,
        email: this.user.email,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.isSaving = false;
          this.isEditing = false;
          this.newPassword = '';
          this.confirmPassword = '';
          this.successMessage =
            'Password changed successfully.';
          this.userUpdated.emit(updatedUser);
        },
        error: (error) => {
          console.error('Failed to change password', error);

          this.isSaving = false;
          this.errorMessage =
            error.error?.messages?.[0] ||
            error.error?.message ||
            'The password could not be changed.';
        },
      });
  }
}