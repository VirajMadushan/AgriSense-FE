import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GreenhouseDto {
  id: number;
  name: string;
  total_area_m2: number;
  section_count: number;
  assigned_user_id?: number | null;
  created_at?: string;
}

export interface SectionDto {
  id: number;
  greenhouse_id?: number;
  section_code: string;
  area_m2: number;

  // comes from Step 4 query (if you updated GET /:id)
  total_devices?: number;
  sensor_count?: number;
  motor_count?: number;
}

@Injectable({ providedIn: 'root' })
export class GreenhousesService {
  private baseUrl = 'http://localhost:4000/api/greenhouses';

  constructor(private http: HttpClient) {}

  getAll(): Observable<GreenhouseDto[]> {
    return this.http.get<GreenhouseDto[]>(this.baseUrl);
  }

  create(payload: { name: string; total_area_m2: number; section_count?: number }): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  getById(id: number): Observable<{ greenhouse: GreenhouseDto; sections: SectionDto[] }> {
    return this.http.get<{ greenhouse: GreenhouseDto; sections: SectionDto[] }>(`${this.baseUrl}/${id}`);
  }
}