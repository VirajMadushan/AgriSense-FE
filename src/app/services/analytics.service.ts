import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type AnalyticsSummary = {
  avgTemp: number | null;
  avgHum: number | null;
  avgSoil: number | null;
  readingsCount: number;
  lastReadingAt: string | null;
};

export type AlertDto = {
  id: number;
  device_id: number | null;
  greenhouse_id: number | null;
  section_id: number | null;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  created_at: string;
  resolved: number;
};

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private baseUrl = 'http://localhost:4000/api/analytics';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.baseUrl}/summary`);
  }

  run(): Observable<any> {
    return this.http.post(`${this.baseUrl}/run`, {});
  }

  getAlerts(): Observable<AlertDto[]> {
    return this.http.get<AlertDto[]>(`${this.baseUrl}/alerts`);
  }
}