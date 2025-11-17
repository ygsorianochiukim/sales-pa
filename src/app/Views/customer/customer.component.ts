import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, Phone, RectangleEllipsis , CalendarCheck2 , MapPinHouse , LandPlot , MapPin , BriefcaseBusiness , Building2 } from 'lucide-angular';
import { Buyer } from 'src/app/Models/Buyers/buyer.model';
import { Buyers } from 'src/app/Services/Buyers/buyers';
import { IonItem } from "@ionic/angular/standalone";
import { IonicModule } from '@ionic/angular';
import { Build } from 'ionicons/dist/types/stencil-public-runtime';
import { Otp } from 'src/app/Models/OTP/otp.model';
import { SendOtpServices } from 'src/app/Services/sendOtp/send-otp-services';
import { AuthServices } from 'src/app/Services/auth/auth';

@Component({
  selector: 'app-customer',
  imports: [IonicModule, LucideAngularModule, RouterLink, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [Buyers , SendOtpServices, AuthServices]
})
export class CustomerComponent implements OnInit {
  readonly user = User;
  readonly phone = Phone;
  readonly otp = RectangleEllipsis;
  readonly calendar = CalendarCheck2;
  readonly place = MapPinHouse;
  readonly zip = LandPlot;
  readonly map = MapPin;
  readonly work = BriefcaseBusiness;
  readonly building = Building2;
  Name: string = '';
  id: number = 0;
  User: any;
  otpCode: string = '';
  otpModel: Otp ={
    otp: '',
    message: '',
    name: '',
    contact: 0
  }
  steps: string[] = ['Personal Info', 'Address Info', 'Other Info'];
  currentStep: number = 0;
  nameFields: any = {
    first_name: '',
    middle_name: '',
    last_name: '',
  };

  buyersField: Buyer = {
    buyers_name:'',
    contact_number: '',
    province: '',
    municipality: '',
    barangay: '',
    purok: '',
    zipcode: null,
    civil_status: '',
    sex: '',
    birthdate: new Date(),
    birthplace: '',
    occupation: '',
    company_name: '',
    created_by: 0,
    otp: '',
  };
  addressData: any = {};
  provincesField: string[] = [];
  municipalitiesField: string[] = [];
  barangaysField: string[] = [];

  constructor(private BuyersServices: Buyers, private http: HttpClient, private SendOTPServices: SendOtpServices , private AuthServices: AuthServices) {}

  ngOnInit() {
    this.http.get('/assets/address.json').subscribe((data: any) => {
      this.addressData = data;
      this.extractProvinces();
    });
    this.fetchUser();
  }
  fetchUser(){
    this.AuthServices.getUserFromAPI().subscribe((Userdata) => {
      this.User = Userdata;
      this.Name = this.User.firstname + " " + this.User.lastname;
      this.id = this.User.s_bpartner_employee_id;
    });
  }
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      if (this.currentStep ==1) {
        this.generateOTP();
      } 
    }
  }

  extractProvinces() {
    const provinceSet = new Set<string>();
    for (const regionCode in this.addressData) {
      const region = this.addressData[regionCode];
      for (const province in region.province_list) {
        provinceSet.add(province);
      }
    }
    this.provincesField = Array.from(provinceSet).sort();
  }

  onProvinceChange() {
    this.municipalitiesField = [];
    this.barangaysField = [];
    this.buyersField.municipality = '';
    this.buyersField.barangay = '';

    for (const regionCode in this.addressData) {
      const region = this.addressData[regionCode];
      if (region.province_list[this.buyersField.province!]) {
        const municipalityList = region.province_list[this.buyersField.province!].municipality_list;
        this.municipalitiesField = Object.keys(municipalityList).sort();
        break;
      }
    }
  }

  onMunicipalityChange() {
    this.barangaysField = [];
    this.buyersField.barangay = '';

    for (const regionCode in this.addressData) {
      const region = this.addressData[regionCode];
      if (region.province_list[this.buyersField.province!]) {
        const munList = region.province_list[this.buyersField.province!].municipality_list;
        if (munList[this.buyersField.municipality!]) {
          this.barangaysField = munList[this.buyersField.municipality!].barangay_list.sort();
        }
        break;
      }
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  generateOTP() 
  {
    this.otpCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    this.otpModel.contact = Number(this.buyersField.contact_number);
    this.otpModel.name = this.nameFields.first_name + ' ' +this.nameFields.middle_name + ' ' + this.nameFields.last_name
    this.otpModel.otp = this.otpCode;
    this.otpModel.message = `Good Day Mr/Ms. ${this.otpModel.name}. We Would like to inform you that your OTP is ${this.otpModel.otp}. Thank you`
    this.SendOTPServices.sendOtp(this.otpModel).subscribe(() => {
    });
  }

  submitBuyersInfo() {
    this.buyersField.buyers_name = this.nameFields.first_name + ' ' +this.nameFields.middle_name + ' ' + this.nameFields.last_name,
    this.buyersField.created_by = this.id;
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
