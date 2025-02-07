import { inject,Injectable   } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiUrl = 'http://localhost:3000/';

  http = inject(HttpClient);


  signup(user: any): Observable<any> {
    return this.checkEmailExists(user.email).pipe(
      switchMap(emailExists => {
        if (emailExists) {
          return throwError(() => new Error('Email already exists'));
        }
        return this.hashPassword(user.password).pipe(
          switchMap(hashedPassword => {
            const userToCreate = {
              ...user,
              points: 0,
              role: 'individual',
              password: hashedPassword
            };

            return this.http.post<any>(this.apiUrl +"users" , userToCreate).pipe(
              map(createdUser => {
                this.storeUserInfo(createdUser);
                return createdUser;
              }),
              catchError(error => {
                console.error('Signup error', error);
                return throwError(() => new Error('Signup failed'));
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Signup process error', error);
        return throwError(() => error);
      })
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}users?email=${email}`).pipe(
      map(users => users.length > 0),
      catchError(error => {
        console.error('Error checking email', error);
        return throwError(() => new Error('Error checking email'));
      })
    );
  }

  hashPassword(password: string): Observable<string> {
    return of(bcrypt.hashSync(password, 10));
  }

  storeUserInfo(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  }
}
