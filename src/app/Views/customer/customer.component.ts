import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, Phone, RectangleEllipsis } from 'lucide-angular';
import { Buyer } from 'src/app/Models/Buyers/buyer.model';
import { Buyers } from 'src/app/Services/Buyers/buyers';

@Component({
  selector: 'app-customer',
  imports: [LucideAngularModule, RouterLink, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [Buyers]
})
export class CustomerComponent implements OnInit {
  readonly user = User;
  readonly phone = Phone;
  readonly otp = RectangleEllipsis;

  otpCode: string = '';
  steps: string[] = ['Personal Info', 'Address Info', 'Other Info'];
  currentStep: number = 0;
  nameFields: any = {
    first_name: '',
    middle_name: '',
    last_name: '',
  };

  buyersField: Buyer = {
    buyers_name: this.nameFields.first_name + ' ' +this.nameFields.middle_name + ' ' + this.nameFields.last_name,
    contact_number: '',
    province: '',
    municipality: '',
    barangay: '',
    purok: '',
    zipcode: 0,
    civil_status: '',
    sex: '',
    birthdate: new Date(),
    birthplace: '',
    occupation: '',
    company_name: '',
    created_by: 2,
    otp: '',
  };

  constructor(private BuyersServices: Buyers) {}

  ngOnInit() {}
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  generateOTP() {
    this.otpCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  }

  submitBuyersInfo() {
    this.BuyersServices.storeBuyers(this.buyersField).subscribe(() => {
      this.reset();
    });
  }

  reset() {
    this.buyersField = {
      buyers_name: '',
      contact_number: '',
      province: '',
      municipality: '',
      barangay: '',
      zipcode: 0,
      otp: ''
    };
    this.currentStep = 0;
    this.otpCode = '';
  }
}
