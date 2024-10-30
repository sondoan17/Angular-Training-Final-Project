import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <img class="mx-auto h-12 w-auto" src="assets/images/logo.png" alt="Logo" />
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
        </div>

        <form (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="password" class="sr-only">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="newPassword"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="New Password"
                [disabled]="isLoading"
              />
            </div>
            <div>
              <label for="confirmPassword" class="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                [(ngModel)]="confirmPassword"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                [disabled]="isLoading"
              />
            </div>
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
              {{ isLoading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.showMessage('Invalid token');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      }
    });
  }

  onSubmit(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.showMessage('Please enter both passwords');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showMessage('Passwords do not match');
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.showMessage('Password has been reset successfully');
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showMessage(error.error?.message || 'Failed to reset password');
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