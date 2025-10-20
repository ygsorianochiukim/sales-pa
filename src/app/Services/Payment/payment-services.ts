import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Payments } from 'src/app/Models/Payment/payments.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentServices {
  private apiUrl = `${environment.apiUrl}/payment`;
  
  constructor(private http : HttpClient) {}

  displayPayments(): Observable<Payments[]>{
    return this.http.get<Payments[]>(this.apiUrl);
  }

  storePayments(post: Payments) : Observable<Payments>{
    return this.http.post<Payments>(this.apiUrl, post);
  }
}
