import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LotAvailable } from 'src/app/Models/LotAvailabilities/lot-available.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LotAvailabilitiesServices {
  private apiUrl = `${environment.apiUrl}/lots`;
  
  constructor(private http : HttpClient) {}

  dropDownAvailabilities(): Observable<LotAvailable[]>{
    return this.http.get<LotAvailable[]>(`${this.apiUrl}/availability`);
  }
}
