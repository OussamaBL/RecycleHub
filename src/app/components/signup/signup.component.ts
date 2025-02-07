
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]), // Example: 10-digit phone number
      dateOfBirth: new FormControl('', [Validators.required])
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
        this.errorMessage = 'Please correct the errors in the form.';
      return;
    }

    const user = this.signupForm.value;

    this.authService.signup(user).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        this.signupForm.reset();
        this.router.navigate(['/collection-request']);
      },
      error: (error) => {
        if (error.message === 'Email already exists') {
          this.errorMessage = 'This email is already registered. Please use a different email.';
        } else {
          this.errorMessage = 'Signup failed. Please try again.';
        }
        console.error('Signup error', error);
      }
    });
  }
}
