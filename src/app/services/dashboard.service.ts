import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardStats {
  users: {
    total: number;
    admins: number;
    normalUsers: number;
  };
  devices: {
    total: number;
    on: number;
    off: number;
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

/** ✅ NEW TYPE (this fixes your error) */
export interface GreenhouseOverview {
  kpis: {
    total_greenhouses: number;
    total_sections: number;
    total_devices: number;
    total_sensors: number;
    total_motors: number;
  };
  greenhouses: Array<{
    id: number;
    name: string;
    total_area_m2: number;
    section_count: number;
    zones: number;
    devices: number;
  }>;
  zoneStatus: Array<{
    section_id: number;
    greenhouse_id: number;
    section_code: string;
    avg_temp: number | null;
    avg_hum: number | null;
    avg_soil: number | null;
    last_update: string | null;
  }>;
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

  /** ✅ Typed method */
  getGreenhouseOverview(): Observable<GreenhouseOverview> {
    return this.http.get<GreenhouseOverview>(`${this.baseUrl}/greenhouse-overview`);
  }
}