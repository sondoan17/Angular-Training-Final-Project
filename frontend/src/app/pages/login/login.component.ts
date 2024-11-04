import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.initializeGoogleSignIn();
  }

  onSubmit(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.navigateToDashboard(),
      error: (error) => console.error('Login failed', error),
    });
  }

  private initializeGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleCredentialResponse.bind(this),
    });
    this.renderGoogleSignInButton();
  }

  private renderGoogleSignInButton(): void {
    google.accounts.id.renderButton(document.getElementById('googleBtn'), {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      logo_alignment: 'center',
    });
  }

  private handleCredentialResponse(response: any): void {
    this.authService.loginWithGoogle(response.credential).subscribe({
      next: () => this.navigateToDashboard(),
      error: (error) => console.error('Google login failed', error),
    });
  }

  private navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
