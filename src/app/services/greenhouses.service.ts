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
  section_code: string;
  area_m2: number;

  total_devices?: number;
  sensor_count?: number;
  motor_count?: number;
}
export interface SectionWithGhDto extends SectionDto {
  greenhouse_id: number;
}

export interface GreenhouseWithSectionsDto extends GreenhouseDto {
  sections: SectionWithGhDto[];
}

@Injectable({ providedIn: 'root' })
export class GreenhousesService {
  private baseUrl = 'http://localhost:4000/api/greenhouses';

  constructor(private http: HttpClient) { }

  getAll(): Observable<GreenhouseDto[]> {
    return this.http.get<GreenhouseDto[]>(this.baseUrl);
  }

  create(payload: { name: string; total_area_m2: number; section_count?: number }) {
    return this.http.post<{ greenhouse: GreenhouseDto; sections: SectionDto[] }>(this.baseUrl, payload);
  }

  getById(id: number) {
    return this.http.get<{ greenhouse: GreenhouseDto; sections: SectionDto[] }>(`${this.baseUrl}/${id}`);
  }
  getWithSections(): Observable<GreenhouseWithSectionsDto[]> {
    return this.http.get<GreenhouseWithSectionsDto[]>(`${this.baseUrl}/with-sections`);
  }

  update(id: number, payload: { name: string; total_area_m2: number; section_count?: number }) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}