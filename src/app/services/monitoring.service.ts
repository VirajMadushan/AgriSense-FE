import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LiveReadingDto {
  device_id: number;
  device_name: string;
  device_type: string;
  status: 'ON' | 'OFF';
  location?: string | null;

  temperature?: number | null;
  humidity?: number | null;
  soil_moisture?: number | null;
  created_at?: string | null;
}

export interface ReadingHistoryDto {
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private baseUrl = 'http://localhost:4000/api/monitoring';

  constructor(private http: HttpClient) {}

  getLive(): Observable<LiveReadingDto[]> {
    return this.http.get<LiveReadingDto[]>(`${this.baseUrl}/live`);
  }

  getHistory(deviceId: number): Observable<ReadingHistoryDto[]> {
    return this.http.get<ReadingHistoryDto[]>(`${this.baseUrl}/device/${deviceId}`);
  }
}
