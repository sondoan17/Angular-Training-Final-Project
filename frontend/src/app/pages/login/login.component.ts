import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  private googleInitialized = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.googleInitialized) {
      this.initializeGoogleSignIn();
    }
  }

  ngOnDestroy(): void {
    if (this.googleInitialized && typeof google !== 'undefined') {
      google.accounts.id.cancel();
      this.googleInitialized = false;
    }
  }

  onSubmit(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
        this.navigateToDashboard();
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Login failed', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  private initializeGoogleSignIn(): void {
    if (typeof google === 'undefined') {
      setTimeout(() => this.initializeGoogleSignIn(), 100);
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
      });
      
      const googleBtn = document.getElementById('googleBtn');
      if (googleBtn) {
        google.accounts.id.renderButton(
          googleBtn,
          { 
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: 250,
            logo_alignment: 'center'
          }
        );
        this.googleInitialized = true;
      } else {
        console.error('Google sign-in button element not found');
      }
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
    }
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => {
          this.snackBar.open('Successfully logged in with Google!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Google login failed', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
