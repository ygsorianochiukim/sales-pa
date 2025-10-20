import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Otp } from 'src/app/Models/OTP/otp.model';
import { Purchase } from 'src/app/Models/Purchase/purchase.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SendOtpServices {
  private apiUrl = `${environment.apiUrl}/otp`;
  
  constructor(private http : HttpClient) {}

  sendOtp(post: Otp): Observable<Otp>{
    return this.http.post<Otp>(this.apiUrl, post);
  }
}
