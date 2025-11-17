import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, from, BehaviorSubject } from 'rxjs';
import { switchMap, mapTo, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { User } from 'src/app/Models/User/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthServices {
  private apiUrl = 'https://park.renaissance.ph/api';
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticated.asObservable();

  setAuthState(state: boolean) {
    this.isAuthenticated.next(state);
  }
  constructor(private http: HttpClient, private storage: Storage) { 
    this.init();
  }

  private async init() {
    await this.storage.create();
  }

  login(username: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
    switchMap((res: any) => {
      const tasks: Promise<any>[] = [];

      if (res.access_token) {
        tasks.push(this.storage.set('token', res.access_token));
      }
      if (res.user) {
        tasks.push(this.storage.set('User', res.user));
      }

      return from(Promise.all(tasks)).pipe(
        tap(() => this.setAuthState(true)),
        mapTo(res)
      );
    })
  );
}

  getUserFromAPI(): Observable<any> {
    return from(this.storage.get('token')).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });
        return this.http.get(`${this.apiUrl}/me`, { headers });
      })
    );
  }


  async getToken(): Promise<string | null> {
    return this.storage.get('token');
  }

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  async loadAuthState() {
    const token = await this.storage.get('token');
    this.setAuthState(!!token);
  }

  logout(): Observable<any> {
    return from(this.storage.get('token')).pipe(
      switchMap(token => {
        if (!token) {
          throw new Error('No token found');
        }
        return this.http.post(
          `${this.apiUrl}/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }),
      switchMap(() => from(this.storage.remove('token'))),
      switchMap(() => from(this.storage.remove('User'))),
      tap(() => this.setAuthState(false))
    );
  }

  changePassword(userId: number, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/userAccount/password/${userId}`, {password: password});
  }
}
