import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule , ScanQrCode , HandCoins} from 'lucide-angular';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  imports: [ RouterLink , LucideAngularModule]
})
export class PaymentsComponent  implements OnInit {
  readonly ScanQrCode = ScanQrCode;
  readonly HandCoins = HandCoins;
  constructor() { }

  ngOnInit() {}

}
