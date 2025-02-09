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

  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}users?email=${email}`).pipe(
      switchMap(users => {
        if (users.length === 0) {
          return throwError(() => new Error('User not found'));
        }

        const user = users[0];

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
          return throwError(() => new Error('Invalid password'));
        }

        this.storeUserInfo(user);

        return of(user);
      }),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  }

  isCollector(): boolean {

    const userString = localStorage.getItem('currentUser');
    if (!userString) {
      return false;
    }
    try {
      const user: User = JSON.parse(userString);
      return user.role ==='collector';
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return false;
    }
  }


  getCurrentUser(): Observable<User | null> {
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
      return of(null);
    }

    try {
      const user: User = JSON.parse(userString);
      return this.getUser(user.email).pipe(
        map(fetchedUser => {
          if (fetchedUser && fetchedUser.length > 0) {
            return { ...user, password: fetchedUser[0].password };
          }
          return user;
        }),
        catchError(error => {
          console.error('Error fetching user details:', error);
          return of(user);
        })
      );
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return of(null);
    }
  }

  getUser(email: string): Observable<User[]> {
    if (!email) {
      return of([]);
    }

    return this.http.get<User[]>(`${this.apiUrl}users`, {
      params: new HttpParams().set('email', email)
    }).pipe(
      catchError(error => {
        console.error('Error fetching user:', error);
        return of([]);
      })
    );
  }


  updateUser(user: any): Observable<any> {
    return this.getCurrentUser().pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return throwError(() => new Error('No user is currently logged in'));
        }
        return this.http.put<any>(`${this.apiUrl}users/${currentUser.id}`, user).pipe(
          map(updatedUser => {
            this.storeUserInfo(updatedUser);
            return updatedUser;
          }),
          catchError(error => {
            console.error('Update user error', error);
            return throwError(() => new Error('Failed to update user'));
          })
        );
      })
    );
  }

  deleteUser(id: string): Observable<any> {
    this.logout();
    return this.http.delete<any>(`${this.apiUrl}users/${id}`).pipe(
      map(() => {
        this.logout();
        return true;
      }),
      catchError(error => {
        console.error('Delete user error', error);
        return throwError(() => new Error('Failed to delete user'));
      }));
  }

  updateUserAfterCalcul(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}users/${user.id}`, user).pipe(
      catchError(error => {
        console.error('Update user error', error);
        return throwError(() => new Error('Failed to update user'));
      })
    );
  }
}
