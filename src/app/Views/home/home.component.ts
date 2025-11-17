import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule , UserCheck , ReceiptText, HandCoins , ScanQrCode , Cog} from 'lucide-angular';
import { AuthServices } from 'src/app/Services/auth/auth';

@Component({ 
  selector: 'app-home',
  imports: [LucideAngularModule, RouterLink , HttpClientModule , CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [AuthServices]
})
export class HomeComponent  implements OnInit {
  readonly UserCheck = UserCheck;
  readonly ReceiptText = ReceiptText;
  readonly HandCoins = HandCoins;
  readonly ScanQrCode = ScanQrCode;
  readonly Cog = Cog;
  User : any;
  Name : string = "";
  id : string = "";
  constructor(private AuthServices : AuthServices , private route: Router) { }

  ngOnInit() {
    this.fetchUser();
  }

  fetchUser(){
    this.AuthServices.getUserFromAPI().subscribe((Userdata) => {
      this.User = Userdata;
      this.Name = this.User.firstname + " " + this.User.lastname;
      this.id = this.User.s_bpartner_employee_id;
    });
  }

  viewSettings(){
    this.route.navigate([`/settings/${this.id}`]);
  }
}
