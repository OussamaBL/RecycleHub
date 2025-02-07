import { Injectable } from '@angular/core';

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthDate: string;
  address: string;
}
@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor() { }

  login(email: string, password: string): boolean {
    const user = this.getUser();
    if (user && user.email === email && user.password === password) {
      return true;
    }
    return false;
  }

  getUser(): User | null {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }
}
