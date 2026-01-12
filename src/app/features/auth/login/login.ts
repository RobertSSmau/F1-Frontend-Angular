import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = signal('bob');
  password = signal('1234');
  isLoading = this.authService.isLoading;
  error = this.authService.error;
  sessionError = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'session_expired') {
        this.sessionError.set('Sessione scaduta. Effettua nuovamente il login.');
      }
    });
  }

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