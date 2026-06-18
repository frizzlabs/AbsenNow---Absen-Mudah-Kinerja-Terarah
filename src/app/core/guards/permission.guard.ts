import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role.service';

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const roleService = inject(RoleService);
    const router = inject(Router);

    if (roleService.can(permission)) {
      return true;
    }
    return router.createUrlTree(['/home']);
  };
};

/** Blokir superadmin dari halaman yang tidak relevan (absensi), redirect ke /home */
export const nonAdminGuard: CanActivateFn = () => {
  const roleService = inject(RoleService);
  const router = inject(Router);

  if (roleService.role?.name === 'superadmin') {
    return router.createUrlTree(['/home']);
  }
  return true;
};
