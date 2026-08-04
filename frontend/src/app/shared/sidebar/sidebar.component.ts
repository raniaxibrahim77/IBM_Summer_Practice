import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../sidebar.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  constructor(
    public sidebarService: SidebarService,
    private authService: AuthService
  ) {}

  logout(): void {
    this.authService.logout();
    this.sidebarService.close();
  }
}