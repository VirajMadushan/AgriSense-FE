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

  showFieldError(field: 'email' | 'password'): boolean {
  const control = this.loginForm.get(field);
  return !!(control && control.invalid && (control.touched || control.dirty));
}
  errorMsg = '';
  loading = false;

onLogin() {
  this.errorMsg = '';

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;

  const { email, password } = this.loginForm.value;

  this.auth.login(email, password).subscribe({
    next: (res: any) => {
      this.loading = false;

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);

      if (res.role === 'admin') {
        this.router.navigate(['/dashboard/admin-dashboard']);
      } else {
        this.router.navigate(['/dashboard/user-dashboard']);
      }
    },
    error: (err) => {
      this.loading = false;

       console.log('LOGIN ERROR ', err); 
      // show backend message if available
      this.errorMsg =
        err?.error?.message ||
        'Invalid email or password. Please try again.';
    }
  });
}

}
