import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from 'src/app/Models/Purchase/purchase.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseServices {
  private apiUrl = `${environment.apiUrl}/purchase`;
  
  constructor(private http : HttpClient) {}

  displayPurchase(): Observable<Purchase[]>{
    return this.http.get<Purchase[]>(this.apiUrl);
  }

  storePurchase(post: Purchase) : Observable<Purchase>{
    return this.http.post<Purchase>(this.apiUrl, post);
  }

  lookUpPa(id: string): Observable<Purchase>{
    return this.http.get<Purchase>(`${this.apiUrl}/salesLookup/${id}`);
  }

  lookupName(name: string): Observable<Purchase>{
    return this.http.get<Purchase>(`${this.apiUrl}/lookupName/${name}`);
  }
}
