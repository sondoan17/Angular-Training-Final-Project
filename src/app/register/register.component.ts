import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        console.log('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = error.message || 'An error occurred during registration';
      }
    });
  }
}
