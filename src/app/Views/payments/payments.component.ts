import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule , ScanQrCode , HandCoins} from 'lucide-angular';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  imports: [ RouterLink , LucideAngularModule , FormsModule, HttpClientModule]
})
export class PaymentsComponent  implements OnInit {
  readonly ScanQrCode = ScanQrCode;
  readonly HandCoins = HandCoins;
  constructor() { }

  ngOnInit() {}

}
