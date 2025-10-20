import { Component } from '@angular/core';
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Fullscreen, QrCode } from 'lucide-angular';
import { IonicModule, Platform } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import jsQR from 'jsqr';
import { PurchaseServices } from 'src/app/Services/Purchase/purchase';

interface PersonData {
  idType?: string;
  name?: string;
  id?: string;
  dateOfBirth?: string;
  address?: string;
  image?: string;
  rawText?: string;
  timestamp?: Date;
}

@Component({
  selector: 'app-scan-id',
  templateUrl: './scan-id.component.html',
  styleUrls: ['./scan-id.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, LucideAngularModule, RouterLink],
  providers: [PurchaseServices]
})
export class ScanIDComponent {
  readonly camera = Fullscreen;
  readonly qrcode = QrCode;

  scanning = false;
  loading = false;
  capturedImage = '';
  currentPersonData: PersonData | null = null;
  selectedID: string | null = null;
  isWeb = false;

  PaDisplay: string = '';
  Name: string = '';
  number: string = '';

  constructor(private platform: Platform, private router: Router, private PurchaseServices : PurchaseServices) {
    this.isWeb = !this.platform.is('capacitor');
  }

  async startCamera() {
    if (!this.selectedID) {
      alert('Please select an ID type first.');
      return;
    }

    if (this.selectedID === 'National ID') {
      this.isWeb ? await this.uploadQRImage() : await this.startQRScanner();
    } else {
      await this.startOCRScanner();
    }
  }
  async startQRScanner() {
    try {
      const permissions = await BarcodeScanner.requestPermissions();
      if (permissions.camera !== 'granted') {
        alert('Camera permission required.');
        return;
      }

      this.scanning = true;
      const result = await BarcodeScanner.scan();

      if (result?.barcodes?.length > 0) {
        const qrValue = result.barcodes[0].rawValue;
        this.currentPersonData = {
          idType: 'National ID',
          id: qrValue,
          name: 'Detected from QR',
          rawText: qrValue,
          timestamp: new Date(),
        };
      } else {
        alert('No QR code detected.');
      }
    } catch (error) {
      console.error('QR Scan Error:', error);
      alert('QR scanning failed. Try uploading a QR image instead.');
      await this.uploadQRImage();
    } finally {
      this.scanning = false;
    }
  }
  async startOCRScanner() {
    try {
      this.scanning = true;

      const image = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.Base64,
        allowEditing: false,
        direction: CameraDirection.Rear,
      });

      if (!image?.base64String) {
        this.scanning = false;
        return;
      }

      this.capturedImage = `data:image/jpeg;base64,${image.base64String}`;
      this.loading = true;

      const processedImage = await this.preprocessImage(this.capturedImage);
      const base64Data = processedImage.split(',')[1];

      const apiKey = 'AIzaSyABmgNZ65tghNNB_lCA2cspOS1RmP0RNVg';
      const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const body = {
        requests: [
          {
            image: { content: base64Data },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      };

      const response: any = await fetch(visionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((res) => res.json());

      const text = response?.responses?.[0]?.fullTextAnnotation?.text || '';
      const clean = this.cleanText(text);
      const parsed = this.parseDriversLicense(clean);

      this.currentPersonData = {
        idType: parsed.idType,
        name: parsed.name,
        id: parsed.licenseNumber || parsed.id,
        dateOfBirth: parsed.birthDate,
        address: parsed.address,
        rawText: clean,
        image: this.capturedImage,
        timestamp: new Date(),
      };
    } catch (err) {
      console.error('OCR error:', err);
      alert('OCR processing failed.');
    } finally {
      this.loading = false;
      this.scanning = false;
    }
  }

  async uploadQRImage() {
    return new Promise<void>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return resolve();

        const reader = new FileReader();
        reader.onload = async () => {
          const imageData = reader.result as string;
          this.capturedImage = imageData;
          this.loading = true;

          const img = new Image();
          img.src = imageData;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, img.width, img.height);
            const code = jsQR(data.data, data.width, data.height);

            if (code) {
              const qrValue = code.data;
              this.currentPersonData = {
                idType: 'National ID',
                id: qrValue,
                name: 'Detected from uploaded QR',
                rawText: qrValue,
                timestamp: new Date(),
              };
            } else alert('No QR detected.');

            this.loading = false;
            resolve();
          };
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }
  private preprocessImage(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const scale = 2.5;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
    });
  }
  private cleanText(text: string): string {
    return text.replace(/[^\w\s,.\-/:]/g, '').replace(/\s+/g, ' ').trim();
  }

  parseDriversLicense(text: string) {
    let cleanText = text
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .toUpperCase();
    cleanText = cleanText
      .replace(/REPUBLIC OF THE PHILIPPINES|DEPARTMENT OF TRANSPORTATION|LAND TRANSPORTATION OFFICE|DRIVER'?S LICENSE|OFFICE|TRANSPORTATION/g, '')
      .replace(/MIDDLE NAME|LAST NAME|FIRST NAME|SEX|HEIGHT|WEIGHT|ADDRESS|NATIONALITY|BIRTH DATE|SIGNATURE|AGENCY CODE|EYES COLOR|BLOOD TYPE|CONDITIONS?/g, '')
      .trim();

    const result: any = {};
    result.idType = "Driver's License";
    const nameMatch = cleanText.match(/([A-ZÑ\s]+),\s*([A-ZÑ\s]+)/);
    if (nameMatch) {
      result.name = nameMatch[0]
        .replace(/\s{2,}/g, ' ')
        .replace(/\b(MIDDLE NAME|LAND|OFFICE|TRANSPORTATION)\b/g, '')
        .trim();
    } else {
      result.name = '';
    }
    const licMatch = cleanText.match(/[A-Z]\d{2}-\d{2}-\d{6}/);
    result.licenseNumber = licMatch ? licMatch[0] : '';
    const dateMatches = cleanText.match(/\b(19|20)\d{2}\/\d{2}\/\d{2}\b/g);
    result.birthDate = dateMatches?.[0] || '';
    result.expirationDate = dateMatches?.[1] || '';
    const addrMatch = cleanText.match(/PRK\s?[0-9A-Z\s,.-]+CITY/);
    result.address = addrMatch ? addrMatch[0].trim() : '';
    const bloodMatch = cleanText.match(/\b(O|A|B|AB)[+-]\b/);
    result.bloodType = bloodMatch ? bloodMatch[0] : '';
    const heightMatch = cleanText.match(/\b\d\.\d{2}\b/);
    result.height = heightMatch ? heightMatch[0] : '';
    const natMatch = cleanText.match(/\bPHL\b/);
    result.nationality = natMatch ? natMatch[0] : '';
    return result;
  }
  cancelScan() {
    this.resetCurrentScan();
  }
  saveAndContinue() {
    console.log('Saving scan result:', this.currentPersonData);
    this.PurchaseServices.lookupName(this.currentPersonData?.name!).subscribe((data: any) => {
      console.log(data);
      this.Name = data.buyers_name;
      this.PaDisplay = data.sales_temp_pa;
      this.number = data.contact_number;
    });
  }

  private resetCurrentScan() {
    this.capturedImage = '';
    this.currentPersonData = null;
    this.scanning = false;
    this.loading = false;
  }
}
