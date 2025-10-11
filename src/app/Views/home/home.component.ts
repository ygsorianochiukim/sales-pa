import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule , UserCheck , ReceiptText, HandCoins , ScanQrCode} from 'lucide-angular';

@Component({ 
  selector: 'app-home',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {
  readonly UserCheck = UserCheck;
  readonly ReceiptText = ReceiptText;
  readonly HandCoins = HandCoins;
  readonly ScanQrCode = ScanQrCode;
  constructor() { }

  ngOnInit() {}

}
