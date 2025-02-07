import { Routes } from '@angular/router';
import { SignupComponent } from "./components/signup/signup.component";
import { redirectIfAuthenticateGuard } from './guards/redirect-if-authenticate.guard';


export const routes: Routes = [
  { path: 'signup', component: SignupComponent , canActivate: [redirectIfAuthenticateGuard] },
];
