import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { LucideAngularModule , IdCard , ScanSearch , CircleCheckBigIcon , RectangleEllipsis , PhilippinePeso } from 'lucide-angular';
import { Otp } from 'src/app/Models/OTP/otp.model';
import { Payments } from 'src/app/Models/Payment/payments.model';
import { PaymentServices } from 'src/app/Services/Payment/payment-services';
import { PurchaseServices } from 'src/app/Services/Purchase/purchase';
import { SendOtpServices } from 'src/app/Services/sendOtp/send-otp-services';

@Component({
  selector: 'app-payment-tagging',
  imports:[ RouterLink , LucideAngularModule , HttpClientModule , CommonModule , FormsModule],
  templateUrl: './payment-tagging.component.html',
  styleUrls: ['./payment-tagging.component.scss'],
  providers: [ PurchaseServices , PaymentServices , SendOtpServices ]
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
  otpModel: Otp ={
    otp: '',
    message: '',
    name: '',
    contact: 0
  }
  constructor(private PurchaseServices: PurchaseServices, private PaymentServices: PaymentServices , private AlertController: AlertController , private Router: Router , private SendOTPServices : SendOtpServices) { }

  ngOnInit() {
  }

  lookup(){
    this.PurchaseServices.lookUpPa(this.SalesPaID!).subscribe((data: any) => {
      this.name = data.buyers_name;
      this.number = data.contact_number;
      this.buyersID = data.buyers_i_information_id;
    });
  }

  generateOTP() {
    this.otpCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    this.otpModel.contact = this.number!;
    this.otpModel.name = this.name;
    this.otpModel.otp = this.otpCode;
    this.otpModel.message = `Good Day Mr/Ms. ${this.otpModel.name}. We Would like to inform you that your OTP is ${this.otpModel.otp}. Thank you`
    this.SendOTPServices.sendOtp(this.otpModel).subscribe(() => {
      
    });
  }
  async confirmPayment(){
    const alert = await this.AlertController.create({
      header: 'Payment added complete!',
      message: 'Payment added complete!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => console.log('Alert canceled'),
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.confirmPaymentProcess();
            this.Router.navigate(['/home']);
          },
        },
      ],
    });
    await alert.present();
  }

  confirmPaymentProcess(){
    this.paymentFields.buyers_i_information_id = this.buyersID;
    this.paymentFields.sales_temp_pa = this.SalesPaID!;
    this.paymentFields.amount = this.Amount;
    this.paymentFields.otp = Number(this.otpCode);
    this.PaymentServices.storePayments(this.paymentFields).subscribe(() => {

    });
  }
}
