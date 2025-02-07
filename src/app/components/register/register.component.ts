import { Component,OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {NgIf} from "@angular/common";
import {HttpClientModule} from "@angular/common/http";
import { AuthService } from '../../services/auth/auth.service';
import Swal from "sweetalert2";


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    HttpClientModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  registrationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
    });
  }
  ngOnInit(): void {}

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    const user: User = this.registrationForm.value;
    const isRegistered = this.authService.register(user);

    if (isRegistered) {
      this.router.navigate(['/login']);
    } else {
      alert('User already exists!');
    }
  }

  get formControl() {
    return this.registrationForm.controls;
  }

}
