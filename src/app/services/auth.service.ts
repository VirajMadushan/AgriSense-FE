import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'  
})
export class AuthService {
  private api = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { email, password })
      .pipe(
        tap((res: any) => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }
}
