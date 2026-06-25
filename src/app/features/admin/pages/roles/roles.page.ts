import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RoleService } from '../../../../core/services/role.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent]
})
export class RolesPage {
  roles: any[] = [];
  isLoading = true;

  constructor(private router: Router, private roleService: RoleService) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.roleService.getRoles().subscribe({
      next: (data) => { this.roles = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  openRole(role: any) {
    this.router.navigate(['/admin/roles', role.id]);
  }

  goUsers() {
    this.router.navigate(['/admin/users']);
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
