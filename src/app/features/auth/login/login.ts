import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sessionError = signal<string | null>(null);

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/championships']);
      return;
    }

    // Check for session expired error
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'session_expired') {
        this.sessionError.set('Sessione scaduta. Effettua nuovamente il login.');
      }
    });
  }

  onLogin(): void {
    // Redirect to Keycloak login
    this.authService.login();
  }
}
  