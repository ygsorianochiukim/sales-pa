import { Component } from '@angular/core';
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import Tesseract from 'tesseract.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LucideAngularModule, Fullscreen, QrCode } from 'lucide-angular';
import { IonicModule, Platform } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import jsQR from 'jsqr';

interface PersonData {
  name: string;
  id: string;
  dateOfBirth?: string;
  address?: string;
  image?: string;
  rawText?: string;
  timestamp?: Date;
  idType?: string;
}

@Component({
  selector: 'app-scan-id',
  templateUrl: './scan-id.component.html',
  styleUrls: ['./scan-id.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule, LucideAngularModule, RouterLink],
})
export class ScanIDComponent {
  readonly camera = Fullscreen;
  readonly qrcode = QrCode;
  scanning = false;
  loading = false;
  scanResult = '';
  capturedImage = '';
  currentPersonData: PersonData | null = null;
  scannedIds: PersonData[] = [];
  filteredIds: PersonData[] = [];
  searchQuery = '';
  selectedPerson: PersonData | null = null;
  selectedID: string | null = null;
  isWeb = false;

  constructor(private platform: Platform) {
    this.isWeb = !this.platform.is('capacitor');
  }

  ngOnInit() {}

  // Main action
  async startCamera() {
    if (!this.selectedID) return;

    if (this.selectedID === 'National ID') {
      // For web or fallback
      if (this.isWeb) {
        await this.uploadQRImage();
      } else {
        await this.startQRScanner();
      }
    } else {
      await this.startOCRScanner();
    }
  }

  // 📸 QR Code Scanner (Mobile)
  async startQRScanner() {
    try {
      const permissions = await BarcodeScanner.requestPermissions();
      if (permissions.camera !== 'granted') {
        alert('Camera permission is required for scanning QR codes.');
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
      alert('QR scanning failed. You can upload a QR image instead.');
      // fallback for mobile if camera scan fails
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
        resultType: CameraResultType.DataUrl,
        allowEditing: false,
        direction: CameraDirection.Rear,
      });

      if (!image?.dataUrl) {
        this.scanning = false;
        return;
      }

      this.capturedImage = image.dataUrl;
      this.loading = true;
      this.scanResult = '';

      const processedImage = await this.preprocessImage(image.dataUrl);
      const { data } = await Tesseract.recognize(processedImage, 'eng', {
        logger: (m) => console.log(m),
      });

      let text = data.text || '';
      console.log('Raw OCR:', text);
      text = this.cleanText(text);
      this.scanResult = text;
      const idType = this.detectIdType(text);

      this.currentPersonData = {
        idType: idType,
        name: this.extractName(text, idType) || 'Not detected',
        id: this.extractIdNumber(text, idType) || 'Not detected',
        image: image.dataUrl,
        rawText: text,
        timestamp: new Date(),
      };
    } catch (err) {
      console.error('Scan error:', err);
      alert('Camera access failed or OCR error.');
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

          try {
            const img = new Image();
            img.src = imageData;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0, img.width, img.height);

              const imageDataObj = ctx.getImageData(0, 0, img.width, img.height);
              const code = jsQR(imageDataObj.data, imageDataObj.width, imageDataObj.height);

              if (code) {
                const qrValue = code.data;
                this.currentPersonData = {
                  idType: 'National ID',
                  id: qrValue,
                  name: 'Detected from uploaded QR',
                  rawText: qrValue,
                  timestamp: new Date(),
                };
              } else {
                alert('No QR code detected in uploaded image.');
              }

              this.loading = false;
              resolve();
            };
          } catch (err) {
            console.error('QR image scan error:', err);
            alert('Error reading QR from image.');
            this.loading = false;
            resolve();
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  // 🧩 Utility & OCR methods
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
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const value = avg > 128 ? 255 : 0;
          data[i] = data[i + 1] = data[i + 2] = value;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
    });
  }

  private cleanText(text: string): string {
    return text.replace(/[^\w\s,.\-/:]/g, '').replace(/\s+/g, ' ').trim();
  }

  private detectIdType(text: string): string {
    const upperText = text.toUpperCase();
    if (upperText.includes('UMID') || upperText.includes('UNIFIED')) return 'UMID';
    if (upperText.includes('SSS')) return 'SSS';
    if (upperText.includes('PAG-IBIG')) return 'PAG-IBIG';
    if (upperText.includes('PHILHEALTH')) return 'PhilHealth';
    if (upperText.includes('DRIVER')) return "Driver's License";
    if (upperText.includes('POSTAL')) return 'Postal ID';
    if (upperText.includes('PASSPORT')) return 'Passport';
    if (upperText.includes('PRC')) return 'PRC ID';
    if (upperText.includes('VOTER')) return "Voter's ID";
    if (upperText.includes('TIN')) return 'TIN ID';
    if (upperText.includes('SENIOR')) return 'Senior Citizen ID';
    if (upperText.includes('PWD')) return 'PWD ID';
    return 'Unknown ID';
  }

  private extractName(text: string, idType: string): string | null {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const commaPattern = /\b[A-Z]{2,}[A-Z\s]+,\s*[A-Z]{2,}[A-Z\s]+\b/;
    const match = text.match(commaPattern);
    if (match) return match[0].trim();
    for (let i = 0; i < lines.length; i++) {
      const lowerLine = lines[i].toLowerCase();
      if ((lowerLine.includes('name') || lowerLine.includes('nombre')) && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (/^[A-Z\s,.-]{8,50}$/.test(nextLine)) return nextLine.trim();
      }
    }
    return null;
  }

  private extractIdNumber(text: string, idType: string): string | null {
    const patterns = [
      /\b[A-Z]{1,4}[-\s]?\d{2}[-\s]?\d{6,8}\b/,
      /\b\d{2}[-\s]?\d{7}[-\s]?\d{1}\b/,
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
      /\b\d{8,12}\b/,
    ];
    for (const p of patterns) {
      const match = text.match(p);
      if (match) return match[0];
    }
    return null;
  }

  // 🧩 UI Actions
  saveAndContinue() {
    console.log('Record Saved:', this.currentPersonData);
    this.resetCurrentScan();
  }

  cancelScan() {
    this.resetCurrentScan();
  }

  resetCurrentScan() {
    this.capturedImage = '';
    this.scanResult = '';
    this.currentPersonData = null;
    this.scanning = false;
    this.loading = false;
  }

  viewDetails(person: PersonData) {
    this.selectedPerson = person;
  }

  closeDetails() {
    this.selectedPerson = null;
  }

  Idselected() {
    console.log('Selected ID:', this.selectedID);
  }
}
