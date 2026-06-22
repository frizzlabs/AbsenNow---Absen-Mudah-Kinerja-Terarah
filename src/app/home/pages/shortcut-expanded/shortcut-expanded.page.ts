import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-home-shortcut-expanded',
  templateUrl: './shortcut-expanded.page.html',
  styleUrls: ['./shortcut-expanded.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ShortcutExpandedPage {
  constructor(
    private location: Location,
    private roleService: RoleService
  ) {}

  get canManageUsers(): boolean {
    const name = this.roleService.role?.name;
    return name === 'superadmin' || name === 'org_admin' || this.roleService.can('users.manage');
  }

  get canManageOffice(): boolean {
    const name = this.roleService.role?.name;
    return name === 'superadmin' || name === 'org_admin' || this.roleService.can('office.manage');
  }

  get canApproveAttendance(): boolean {
    const name = this.roleService.role?.name;
    return name === 'superadmin' || name === 'org_admin' || this.roleService.can('attendance.approve');
  }

  close() {
    this.location.back();
  }
}
