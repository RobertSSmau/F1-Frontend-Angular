import { Component, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Topbar } from '../core/layout/topbar/topbar';
import { Sidebar } from '../core/layout/sidebar/sidebar';

@Component({
  selector: 'app-body',
  imports: [
    CommonModule,
    MatSidenavModule,
    RouterOutlet,
    Topbar,
    Sidebar
  ],
  templateUrl: './body.html',
  styleUrl: './body.css',
})
export class Body {
  sidebarOpened = signal(false);

  toggleSidebar(): void {
    this.sidebarOpened.set(!this.sidebarOpened());
  }
}
