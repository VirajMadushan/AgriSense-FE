import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardStats {
    users: { total: number; 
    admins: number; 
    normalUsers: number; 
  }; 
  devices:{
    total:number;
    on:number;
    off:number;
    assigned: number;
    unassigned: number;
  };
}

export interface UserDashboardStats {
  me: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
  };
  devices: {
    total: number;
    on: number;
    off: number;
  };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = 'http://localhost:4000/api/dashboard';

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.baseUrl}/admin`);
  }

  getUserStats(): Observable<UserDashboardStats> {
    return this.http.get<UserDashboardStats>(`${this.baseUrl}/user`);
  }
}
