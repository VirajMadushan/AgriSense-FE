import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.scss']
})
export class AuthLoginComponent {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) return;

    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: res => {
        this.loading = false;
        const role = res.role;

        if (role === 'admin') {
          this.router.navigate(['/dashboard/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard/user-dashboard']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
