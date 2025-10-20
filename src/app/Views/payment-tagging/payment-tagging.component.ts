import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule , IdCard , ScanSearch , CircleCheckBigIcon , RectangleEllipsis , PhilippinePeso } from 'lucide-angular';
import { Payments } from 'src/app/Models/Payment/payments.model';
import { PaymentServices } from 'src/app/Services/Payment/payment-services';
import { PurchaseServices } from 'src/app/Services/Purchase/purchase';

@Component({
  selector: 'app-payment-tagging',
  imports:[ RouterLink , LucideAngularModule , HttpClientModule , CommonModule , FormsModule],
  templateUrl: './payment-tagging.component.html',
  styleUrls: ['./payment-tagging.component.scss'],
  providers: [ PurchaseServices , PaymentServices ]
})
export class PaymentTaggingComponent  implements OnInit {
  readonly salesPA = IdCard;
  readonly peso = PhilippinePeso;
  readonly scan = ScanSearch;
  readonly check = CircleCheckBigIcon;
  readonly RectangleEllipsis = RectangleEllipsis;
  otpCode: string = '';
  SalesPaID: string | null = null;
  Amount: number | null = null;
  name: string = '';
  number: number | null = null;
  buyersID: number | null = null;
  OTPConfirmation:string = '';
  paymentFields: Payments ={
    buyers_i_information_id: null,
    sales_temp_pa: '',
    amount: null,
    otp: null,
    created_by: 2,
  }
  constructor(private PurchaseServices: PurchaseServices, private PaymentServices: PaymentServices) { }

  ngOnInit() {


  }

  lookup(){
    this.PurchaseServices.lookUpPa(this.SalesPaID!).subscribe((data: any) => {
      this.name = data.buyers_name;
      this.number = data.contact_number;
      this.buyersID = data.buyers_i_information_id;
      this.generateOTP();
    });
  }

  generateOTP() {
    this.otpCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  }

  confirmPayment(){
    this.paymentFields.buyers_i_information_id = this.buyersID;
    this.paymentFields.sales_temp_pa = this.SalesPaID!;
    this.paymentFields.amount = this.Amount;
    this.paymentFields.otp = Number(this.otpCode);
    this.PaymentServices.storePayments(this.paymentFields).subscribe(() => {

    });
    
  }

}
