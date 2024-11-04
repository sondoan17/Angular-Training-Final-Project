import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrls: ['./add-member-dialog.component.css'],
})
export class AddMemberDialogComponent implements OnInit {
  form: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AddMemberDialogComponent>,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.form.get('username')?.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      const username = this.form.get('username')?.value;
      this.userService.checkUserExists(username).subscribe(
        (exists) => {
          this.isLoading = false;
          if (exists) {
            this.dialogRef.close(username);
          } else {
            this.errorMessage = 'User does not exist';
          }
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error checking user existence';
        }
      );
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
