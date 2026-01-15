import { Component, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  @Output() menuToggled = new EventEmitter<void>();
  
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userName = signal<string>('');

  ngOnInit(): void {
    const user = this.authService.getUserInfo();
    this.userName.set(user?.preferred_username || 'User');
  }

  toggleMenu(): void {
    this.menuToggled.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
