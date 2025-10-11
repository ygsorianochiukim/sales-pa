import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import SignaturePad from 'signature_pad';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, Phone, RectangleEllipsis } from 'lucide-angular';
import { IonicModule } from '@ionic/angular';
import { Buyers } from 'src/app/Services/Buyers/buyers';
import { Buyer } from 'src/app/Models/Buyers/buyer.model';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sales-pa',
  standalone: true,
  templateUrl: './sales-pa.component.html',
  styleUrls: ['./sales-pa.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    IonicModule,
    HttpClientModule
  ],
  providers: [ Buyers ]
})
export class SalesPAComponent implements AfterViewInit, OnInit {
  
  readonly user = User;
  readonly phone = Phone;
  readonly otp = RectangleEllipsis;
  BuyersList: Buyer[] = [];
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  signatureImg: string | null = null;

  constructor(private BuyersServices : Buyers){}

  ngOnInit(): void {
    this.displayDropDown();
  }

  displayDropDown(){
    this.BuyersServices.displayBuyers().subscribe((data) => {
      this.BuyersList = data;
    });
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement, {
      minWidth: 1,
      penColor: 'black',
      backgroundColor: 'white',
    });
  }

  clearSignature() {
    this.signaturePad.clear();
    this.signatureImg = null;
  }

  saveSignature() {
    if (!this.signaturePad.isEmpty()) {
      this.signatureImg = this.signaturePad.toDataURL('image/png');
      console.log('Signature saved:', this.signatureImg);
    }
  }
}
