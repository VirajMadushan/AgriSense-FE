import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  id?: number;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  password?: string; 
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private baseUrl = 'http://localhost:4000/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.baseUrl);
  }

  create(user: UserDto): Observable<any> {
    return this.http.post(this.baseUrl, user);
  }

  update(id: number, user: UserDto): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
