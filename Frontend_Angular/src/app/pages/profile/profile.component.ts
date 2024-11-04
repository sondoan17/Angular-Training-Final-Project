import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

import { UserService } from '../../services/user.service';
import { UserProfile } from '../../interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  name: string = '';
  birthDate: string = '';
  isLoading: boolean = false;
  socialMedia: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  } = {
    twitter: '',
    instagram: '',
    linkedin: '',
    github: ''
  };

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        this.username = profile.username;
        this.email = profile.email;
        this.name = profile.name || '';
        this.birthDate = profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '';
        this.socialMedia = profile.socialMedia || {
          twitter: '',
          instagram: '',
          linkedin: '',
          github: ''
        };
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    const updateData = {
      email: this.email,
      name: this.name || undefined,
      birthDate: this.birthDate ? new Date(this.birthDate) : undefined,
      socialMedia: {
        twitter: this.socialMedia.twitter || undefined,
        instagram: this.socialMedia.instagram || undefined,
        linkedin: this.socialMedia.linkedin || undefined,
        github: this.socialMedia.github || undefined
      }
    };

    this.userService.updateUserProfile(updateData).subscribe({
      next: (profile) => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.snackBar.open(error.error.message || 'Error updating profile', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}