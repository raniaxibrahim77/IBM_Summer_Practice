import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showPassword = false;
  submitting = false;
  loginError: string | null = null;

  showRegisterModal = false;
  registerSubmitting = false;
  registerError: string | null = null;

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  registerForm = this.fb.group({
  username: ['', [Validators.required]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
 }); 

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.loginError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const { username, password } = this.form.value;

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.submitting = false;
        this.loginError = err.error?.message ?? 'Invalid username or password';
      },
    });
  }

  openRegisterModal(): void {
    this.registerError = null;
    this.registerForm.reset();
    this.showRegisterModal = true;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  onRegisterSubmit(): void {
    this.registerError = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.registerSubmitting = true;

    const { username, email, password } = this.registerForm.value;

    this.authService.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => {
        this.registerSubmitting = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.registerSubmitting = false;
        this.registerError = err.error?.message ?? 'Could not register';
      },
    });
  }  

}