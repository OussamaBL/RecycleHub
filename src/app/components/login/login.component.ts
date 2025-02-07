import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,RouterModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }


onLogin() {
  if (this.loginForm.invalid) {
    this.errorMessage = 'Please correct the errors in the form.';
    return;
  }

  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: (user) => {
      console.log('Login successful', user);
      this.router.navigate(['/dashboard']);
      this.errorMessage = '';
    },
    error: (error) => {
      if (error.message === 'User not found') {
        this.errorMessage = 'No account found with this email.';
      } else if (error.message === 'Invalid password') {
        this.errorMessage = 'Incorrect password. Please try again.';
      } else {
        this.errorMessage = 'Login failed. Please try again.';
      }
      console.error('Login error', error);
    }
  });
}
}
