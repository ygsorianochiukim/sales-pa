import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import SignaturePad from 'signature_pad';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, Phone, RectangleEllipsis , Calendar } from 'lucide-angular';
import { IonicModule } from '@ionic/angular';
import { Buyers } from 'src/app/Services/Buyers/buyers';
import { Buyer } from 'src/app/Models/Buyers/buyer.model';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Purchase } from 'src/app/Models/Purchase/purchase.model';
import { PurchaseServices } from 'src/app/Services/Purchase/purchase';
import { LotAvailabilitiesServices } from 'src/app/Services/LotAvailabilities/lot-availabilities';
import { LotAvailable } from 'src/app/Models/LotAvailabilities/lot-available.model';

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
  providers: [ Buyers , PurchaseServices , LotAvailabilitiesServices ]
})
export class SalesPAComponent implements AfterViewInit, OnInit {
  
  readonly user = User;
  readonly phone = Phone;
  readonly otp = RectangleEllipsis;
  readonly calendar = Calendar;
  BuyersList: Buyer[] = [];
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  signatureImg: string | null = null;
  name: string = 'sample';

  purchaseField: Purchase = {
    buyers_i_information_id : null,
    mp_i_lot_id : null,
    payment_type : '',
    terms : null,
    e_signature : '',
    beneficiary1 : '',
    beneficiary2 : '',
    datePayment : null,
    created_by : 2,
  }
  lotTypes: string[] = [];      
  dropDownLotAvailable: LotAvailable[] = [];
  filteredLots: any[] = [];
  selectedLotType: string = '';
  purchaseFieldData: any = {};

  constructor(private BuyersServices : Buyers, private PurchaseServices: PurchaseServices, private LotAvailabilitiesServices : LotAvailabilitiesServices){}

  ngOnInit(): void {
    this.displayDropDown();
    this.displayLotDropDown();
  }

  displayDropDown(){
    this.BuyersServices.displayBuyers().subscribe((data) => {
      this.BuyersList = data;
    });
  }
  displayLotDropDown() {
    this.LotAvailabilitiesServices.dropDownAvailabilities().subscribe({
      next: (res: any) => {
        this.dropDownLotAvailable = res || [];
        this.dropDownLotAvailable = this.dropDownLotAvailable.filter(
          (lot: any) => !lot.type?.toLowerCase().includes('deactivated')
        );
        this.lotTypes = [...new Set(this.dropDownLotAvailable.map((lot: any) => lot.type))];
        this.filteredLots = [...this.dropDownLotAvailable];
      },
      error: (err) => console.error('Error loading lots:', err)
    });
  }
  onLotTypeChange(event: any) {
    const selectedType = event.detail.value;
    this.selectedLotType = selectedType;
    if (!selectedType) {
      this.filteredLots = [...this.dropDownLotAvailable];
    } 
    else {
      this.filteredLots = this.dropDownLotAvailable.filter(
        (lot) => lot.type === selectedType
      );
    }
    this.purchaseField.mp_i_lot_id = null;
  }
  submitPurchase(){
    this.PurchaseServices.storePurchase(this.purchaseField).subscribe(() => {

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
      this.purchaseField.e_signature = this.signatureImg;
    }
  }
}
