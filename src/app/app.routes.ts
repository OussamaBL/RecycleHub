import { Routes } from '@angular/router';
import { SignupComponent } from "./components/signup/signup.component";
import { LoginComponent } from './components/login/login.component';
import { redirectIfAuthenticateGuard } from './guards/redirect-if-authenticate.guard';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent , canActivate: [redirectIfAuthenticateGuard] },
  { path: 'login', component: LoginComponent  , canActivate: [redirectIfAuthenticateGuard] },
];
