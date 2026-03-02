import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeviceDto {
  id?: number;
  device_name: string;
  device_type: string;
  status: 'ON' | 'OFF';
  location?: string | null;

  assigned_user_id?: number | null;
  assigned_user_name?: string | null;


  created_at?: string | null;
  updated_at?: string | null;
}

export interface DeviceLogDto {
  id: number;
  action: string;
  old_value: string | null;
  new_value: string | null;
  note: string | null;
  created_at: string;
  created_by_name: string | null;
}

@Injectable({ providedIn: 'root' })
export class DevicesService {
  private baseUrl = 'http://localhost:4000/api/devices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DeviceDto[]> {
    return this.http.get<DeviceDto[]>(this.baseUrl);
  }

  create(device: Partial<DeviceDto>): Observable<any> {
    return this.http.post(this.baseUrl, device);
  }

  update(id: number, device: Partial<DeviceDto>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, device);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getHistory(deviceId: number): Observable<DeviceLogDto[]> {
    return this.http.get<DeviceLogDto[]>(`${this.baseUrl}/${deviceId}/history`);
  }

  getReport(deviceId: number) {
    return this.http.get<{ device: DeviceDto; history: any[] }>(
      `${this.baseUrl}/${deviceId}/report`
    );
  }

  assignToZone(deviceId: number, greenhouse_id: number | null, section_id: number | null) {
  return this.http.patch(`http://localhost:4000/api/devices/${deviceId}/assign`, {
    greenhouse_id,
    section_id
  });
}

  //  USER APIs
  getMyDevices(): Observable<DeviceDto[]> {
  return this.http.get<DeviceDto[]>(`http://localhost:4000/api/my/devices`);
}

 toggleDevice(id: number): Observable<{ status: 'ON' | 'OFF' }> {
  return this.http.post<{ status: 'ON' | 'OFF' }>(`${this.baseUrl}/${id}/toggle`, {});
}
}


