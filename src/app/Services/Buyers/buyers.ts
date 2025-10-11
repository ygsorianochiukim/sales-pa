import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Buyer } from 'src/app/Models/Buyers/buyer.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Buyers {
  private apiUrl = `${environment.apiUrl}/buyers`;
  
  constructor(private http : HttpClient) {}

  displayBuyers(): Observable<Buyer[]>{
    return this.http.get<Buyer[]>(this.apiUrl);
  }

  storeBuyers(post: Buyer) : Observable<Buyer>{
    return this.http.post<Buyer>(this.apiUrl, post);
  }

}
