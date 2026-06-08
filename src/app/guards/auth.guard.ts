import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  const accounts = msalService.instance.getAllAccounts();

  if (accounts.length === 0) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private msalService: MsalService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const accounts = this.msalService.instance.getAllAccounts();

    if (accounts.length === 0) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
