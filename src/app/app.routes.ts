import { Routes } from '@angular/router';
import { SignupComponent } from "./components/signup/signup.component";
import { LoginComponent } from './components/login/login.component';
import { redirectIfAuthenticateGuard } from './guards/redirect-if-authenticate.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { CollectionRequestComponent } from './components/collection-request/collection-request.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent , canActivate: [redirectIfAuthenticateGuard] },
  { path: 'login', component: LoginComponent  , canActivate: [redirectIfAuthenticateGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard]},
  { path: 'collection-request', component: CollectionRequestComponent , canActivate: [authGuard]},
];
