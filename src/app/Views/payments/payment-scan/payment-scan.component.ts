import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule , IdCard , ScanSearch , CircleCheckBigIcon , RectangleEllipsis , PhilippinePeso } from 'lucide-angular';
import { Otp } from 'src/app/Models/OTP/otp.model';
import { Payments } from 'src/app/Models/Payment/payments.model';
import { PaymentServices } from 'src/app/Services/Payment/payment-services';
import { SendOtpServices } from 'src/app/Services/sendOtp/send-otp-services';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-payment-scan',
  imports:[ RouterLink , LucideAngularModule , CommonModule , FormsModule , HttpClientModule],
  templateUrl: './payment-scan.component.html',
  styleUrls: ['./payment-scan.component.scss'],
  providers: [PaymentServices , SendOtpServices]
})
export class PaymentScanComponent  implements OnInit {
  readonly salesPA = IdCard;
  readonly peso = PhilippinePeso;
  readonly scan = ScanSearch;
  readonly check = CircleCheckBigIcon;
  readonly RectangleEllipsis = RectangleEllipsis;
  otpCode: string = '';
  Amount: number | null = null;
  name: string | null = sessionStorage.getItem('paymentName');
  SalesPA: string | null = sessionStorage.getItem('PAgreement');
  BinaryImage: string | null = sessionStorage.getItem('capturedImage');
  number: number | null = Number(sessionStorage.getItem('number'));
  buyerID: number | null = Number(sessionStorage.getItem('buyerID'));
  OTPConfirmation:string = '';
  paymentFields: Payments ={
    buyers_i_information_id: null,
    sales_temp_pa: '',
    amount: null,
    otp: null,
    created_by: 2,
    image_binary: '',
  }
  otpModel: Otp ={
      otp: 0,
      message: '',
      name: '',
      contact: 0
    }
  constructor(private PaymentServices: PaymentServices, private SendOTPServices: SendOtpServices , private alertController : AlertController , private Router : Router) { }

  ngOnInit() {}

  generateOTP() {
    this.otpCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    this.otpModel.contact = this.number!;
    this.otpModel.name = this.name!;
    this.otpModel.otp = Number(this.otpCode);
    this.otpModel.message = `Good Day Mr/Ms. ${this.otpModel.name}. We Would like to inform you that your OTP is ${this.otpModel.otp} with Payment amount of ${this.Amount}. Thank you`
    this.SendOTPServices.sendOtp(this.otpModel).subscribe(() => {

    });
  }
  async confirmBeforeSubmit() {
    const alert = await this.alertController.create({
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
            this.confirmPayment();
            this.Router.navigate(['/home']);
          },
        },
      ],
    });
    await alert.present();
  }

  confirmPayment(){
    this.paymentFields.buyers_i_information_id = this.buyerID;
    this.paymentFields.sales_temp_pa = this.SalesPA!;
    this.paymentFields.amount = this.Amount;
    this.paymentFields.buyers_i_information_id = this.buyerID;
    this.paymentFields.otp = Number(this.otpCode);
    this.paymentFields.image_binary = this.BinaryImage!;
    this.PaymentServices.storePayments(this.paymentFields).subscribe(() => {

    });
  }
}
