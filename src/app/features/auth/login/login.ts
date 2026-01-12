import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('bob');
  password = signal('1234');
  isLoading = this.authService.isLoading;
  error = this.authService.error;

  onLogin(): void {
    const username = this.username();
    const password = this.password();

    if (!username || !password) {
      return;
    }

    this.authService.login(username, password).subscribe((success) => {
      if (success) {
        this.router.navigate(['/championships']);
      }
    });
  }

  onReset(): void {
    this.username.set('');
    this.password.set('');
  }
}