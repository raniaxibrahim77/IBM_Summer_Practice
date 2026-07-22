import { Component, Input } from '@angular/core';
import { SidebarService } from '../sidebar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  userName = 'Guest';
  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  constructor(public sidebarService: SidebarService, private authService: AuthService) {
    this.userName = this.authService.getCurrentUser()?.username ?? 'Guest';
  }
}