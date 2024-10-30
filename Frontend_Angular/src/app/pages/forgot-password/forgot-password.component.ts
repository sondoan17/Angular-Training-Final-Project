import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <img class="mx-auto h-12 w-auto" src="assets/images/logo.png" alt="Logo" />
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              [(ngModel)]="email"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email address"
              [disabled]="isLoading"
            />
          </div>

          <div>
            <button
              type="submit"
              [disabled]="isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <mat-spinner *ngIf="isLoading" [diameter]="20" class="text-white"></mat-spinner>
              </span>
              {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>

          <div class="text-center">
            <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.showMessage('Please enter your email address');
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.showMessage('Password reset link has been sent to your email');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(error.error?.message || 'Failed to send reset link');
      }
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
} 