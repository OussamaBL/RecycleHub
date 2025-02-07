import { Component,OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {NgIf} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import { AuthService } from '../../services/auth/auth.service';
import Swal from "sweetalert2";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    HttpClientModule,

  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {

  }
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    const isAuthenticated = this.authService.login(email, password);

    if (isAuthenticated) {
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome to the application!',
        confirmButtonText: 'OK',
      }).then(() => {
        this.router.navigate(['/member']);
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'An unexpected error occurred.',
        confirmButtonText: 'Try Again',
      });
    }
  }

  get formControl() {
    return this.loginForm.controls;
  }
}
