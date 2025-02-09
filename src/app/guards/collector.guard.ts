import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const collectorGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (!auth) {
    router.navigate(['/login']);
    return false;
  } else if (auth.role != 'collector') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};
