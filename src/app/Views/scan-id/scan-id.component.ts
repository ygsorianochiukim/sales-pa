import { Component } from '@angular/core';
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import Tesseract from 'tesseract.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

interface PersonData {
  name: string;
  id: string;
  position: string;
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
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class ScanIDComponent {
  scanning = false;
  loading = false;
  scanResult = '';
  capturedImage = '';
  currentPersonData: PersonData | null = null;
  scannedIds: PersonData[] = [];
  filteredIds: PersonData[] = [];
  searchQuery = '';
  selectedPerson: PersonData | null = null;

  ngOnInit() {
    // Load saved IDs from storage
    this.loadFromStorage();
  }

  // 📸 Capture image and run OCR
  async startCamera() {
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

      // Preprocess image
      const processedImage = await this.preprocessImage(image.dataUrl);

      // Run OCR
      const { data } = await Tesseract.recognize(processedImage, 'eng', {
        logger: (m) => console.log(m),
      });

      let text = data.text || '';
      console.log('Raw OCR:', text);

      // Clean up text
      text = this.cleanText(text);
      this.scanResult = text;

      // Extract information
      const idType = this.detectIdType(text);
      
      this.currentPersonData = {
        idType: idType,
        name: this.extractName(text, idType) || 'Not detected',
        id: this.extractIdNumber(text, idType) || 'Not detected',
        position: this.extractPosition(text) || 'N/A',
        image: image.dataUrl,
        rawText: text,
        timestamp: new Date(),
      };

      this.loading = false;
      this.scanning = false;
    } catch (err) {
      console.error('Scan error:', err);
      alert('Camera access failed or OCR error.');
      this.loading = false;
      this.scanning = false;
      this.capturedImage = '';
    }
  }

  // 💾 Save current scan and continue
  saveAndContinue() {
    if (this.currentPersonData) {
      this.scannedIds.push(this.currentPersonData);
      this.filteredIds = [...this.scannedIds];
      this.saveToStorage();
      this.resetCurrentScan();
    }
  }

  // ❌ Cancel current scan
  cancelScan() {
    this.resetCurrentScan();
  }

  // 🔄 Reset current scan
  resetCurrentScan() {
    this.capturedImage = '';
    this.scanResult = '';
    this.currentPersonData = null;
    this.scanning = false;
    this.loading = false;
  }

  // 🗑️ Delete specific ID
  deleteId(person: PersonData) {
    if (confirm(`Delete ID for ${person.name}?`)) {
      this.scannedIds = this.scannedIds.filter(p => p !== person);
      this.filterIds();
      this.saveToStorage();
    }
  }

  // 🗑️ Clear all IDs
  clearAll() {
    if (confirm(`Delete all ${this.scannedIds.length} scanned IDs?`)) {
      this.scannedIds = [];
      this.filteredIds = [];
      this.saveToStorage();
    }
  }

  // 🔍 Filter IDs based on search
  filterIds() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredIds = [...this.scannedIds];
    } else {
      this.filteredIds = this.scannedIds.filter(person =>
        person.name.toLowerCase().includes(query) ||
        person.id.toLowerCase().includes(query) ||
        person.position.toLowerCase().includes(query)
      );
    }
  }

  // 👁️ View details modal
  viewDetails(person: PersonData) {
    this.selectedPerson = person;
  }

  // ❌ Close details modal
  closeDetails() {
    this.selectedPerson = null;
  }

  // 📊 Export to CSV
  exportToCSV() {
    if (this.scannedIds.length === 0) return;

    const headers = ['No', 'Name', 'ID Number', 'Position', 'Date of Birth', 'Address', 'Scanned At'];
    const rows = this.scannedIds.map((person, index) => [
      index + 1,
      person.name,
      person.id,
      person.position,
      person.dateOfBirth || '',
      person.address || '',
      person.timestamp ? new Date(person.timestamp).toLocaleString() : '',
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scanned_ids_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 💾 Save to storage
  private saveToStorage() {
    const data = this.scannedIds.map(person => ({
      ...person,
      image: undefined // Don't save images to reduce storage size
    }));
    localStorage.setItem('scannedIds', JSON.stringify(data));
  }

  // 📥 Load from storage
  private loadFromStorage() {
    const stored = localStorage.getItem('scannedIds');
    if (stored) {
      this.scannedIds = JSON.parse(stored);
      this.filteredIds = [...this.scannedIds];
    }
  }

  // 🎨 Preprocess image
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

  // 🆔 Detect ID Type
  private detectIdType(text: string): string {
    const upperText = text.toUpperCase();
    
    if (upperText.includes('UMID') || upperText.includes('UNIFIED') || upperText.includes('MULTI-PURPOSE')) {
      return 'UMID';
    }
    if (upperText.includes('SSS') || upperText.includes('SOCIAL SECURITY')) {
      return 'SSS';
    }
    if (upperText.includes('PAG-IBIG') || upperText.includes('HDMF') || upperText.includes('HOME DEVELOPMENT')) {
      return 'PAG-IBIG';
    }
    if (upperText.includes('PHILHEALTH') || upperText.includes('PHIL HEALTH') || upperText.includes('PHIC')) {
      return 'PhilHealth';
    }
    if (upperText.includes('DRIVER') || upperText.includes('LICENSE') || upperText.includes('LTO')) {
      return "Driver's License";
    }
    if (upperText.includes('POSTAL') || upperText.includes('POST OFFICE')) {
      return 'Postal ID';
    }
    if (upperText.includes('PASSPORT')) {
      return 'Passport';
    }
    if (upperText.includes('PRC') || upperText.includes('PROFESSIONAL')) {
      return 'PRC ID';
    }
    if (upperText.includes('VOTER') || upperText.includes('COMELEC')) {
      return "Voter's ID";
    }
    if (upperText.includes('TIN') || upperText.includes('TAX')) {
      return 'TIN ID';
    }
    if (upperText.includes('SENIOR') || upperText.includes('CITIZEN')) {
      return 'Senior Citizen ID';
    }
    if (upperText.includes('PWD') || upperText.includes('DISABILITY')) {
      return 'PWD ID';
    }
    
    return 'Unknown ID';
  }

  // 🔤 Enhanced name extraction for different ID types
  private extractName(text: string, idType: string): string | null {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // SSS specific pattern (often has "SURNAME GIVEN NAME MIDDLE NAME")
    if (idType === 'SSS') {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toUpperCase().includes('NAME') && i + 1 < lines.length) {
          const nameFields = [];
          for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
            if (/^[A-Z\s.-]{2,}$/.test(lines[j])) {
              nameFields.push(lines[j]);
            }
          }
          if (nameFields.length >= 2) {
            return nameFields.join(', ');
          }
        }
      }
    }
    
    // UMID specific pattern
    if (idType === 'UMID') {
      const umidNamePattern = /([A-Z]+)\s+([A-Z]+)\s+([A-Z]+)/;
      for (const line of lines) {
        const match = line.match(umidNamePattern);
        if (match && !line.includes('UNIFIED') && !line.includes('REPUBLIC')) {
          return line.trim();
        }
      }
    }
    
    // PAG-IBIG specific
    if (idType === 'PAG-IBIG') {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes('member') || line.toLowerCase().includes('name')) {
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (/^[A-Z\s,.-]{8,50}$/.test(nextLine) && !nextLine.includes('HDMF')) {
              return nextLine.trim();
            }
          }
        }
      }
    }
    
    // Pattern 1: "LAST NAME, FIRST NAME MIDDLE NAME"
    const commaPattern = /\b[A-Z]{2,}[A-Z\s]+,\s*[A-Z]{2,}[A-Z\s]+\b/;
    let match = text.match(commaPattern);
    if (match) return match[0].trim();
    
    // Pattern 2: Look for line after "Name" label
    for (let i = 0; i < lines.length; i++) {
      const lowerLine = lines[i].toLowerCase();
      if ((lowerLine.includes('name') || lowerLine.includes('nombre')) && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (/^[A-Z\s,.-]{8,50}$/.test(nextLine)) {
          return nextLine.trim();
        }
      }
    }
    
    // Pattern 3: All caps name format
    const excludeWords = ['REPUBLIC', 'DEPARTMENT', 'LICENSE', 'OFFICE', 'PHILIPPINES', 'UMID', 'SSS', 'PAG-IBIG', 'PHILHEALTH', 'CARD', 'IDENTIFICATION'];
    for (const line of lines) {
      if (/^[A-Z]{2,}[\sA-Z,.-]{8,50}$/.test(line)) {
        if (!excludeWords.some(word => line.includes(word))) {
          return line.trim();
        }
      }
    }
    
    return null;
  }

  // 🔢 Enhanced ID number extraction for different ID types
  private extractIdNumber(text: string, idType: string): string | null {
    // SSS Number: XX-XXXXXXX-X
    if (idType === 'SSS') {
      const sssPattern = /\b\d{2}[-\s]?\d{7}[-\s]?\d{1}\b/;
      const match = text.match(sssPattern);
      if (match) return match[0];
    }
    
    // UMID Number: XXXX-XXXXXXX-X
    if (idType === 'UMID') {
      const umidPattern = /\b\d{4}[-\s]?\d{7}[-\s]?\d{1}\b/;
      const match = text.match(umidPattern);
      if (match) return match[0];
    }
    
    // PAG-IBIG Number: XXXX-XXXX-XXXX
    if (idType === 'PAG-IBIG') {
      const pagibigPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/;
      const match = text.match(pagibigPattern);
      if (match) return match[0];
    }
    
    // PhilHealth Number: XX-XXXXXXXXX-X
    if (idType === 'PhilHealth') {
      const philhealthPattern = /\b\d{2}[-\s]?\d{9}[-\s]?\d{1}\b/;
      const match = text.match(philhealthPattern);
      if (match) return match[0];
    }
    
    // TIN: XXX-XXX-XXX-XXX
    if (idType === 'TIN ID') {
      const tinPattern = /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/;
      const match = text.match(tinPattern);
      if (match) return match[0];
    }
    
    // Driver's License: ABC-12-345678
    if (idType === "Driver's License") {
      const dlPattern1 = /\b[A-Z]{1,4}[-\s]?\d{2}[-\s]?\d{6,8}\b/;
      const match = text.match(dlPattern1);
      if (match) return match[0];
    }
    
    // Generic patterns
    const idPattern1 = /\b[A-Z]{1,4}[-\s]?\d{2}[-\s]?\d{6,8}\b/;
    let match = text.match(idPattern1);
    if (match) return match[0];
    
    const idPattern2 = /\b\d{2}[-\s]?\d{7}[-\s]?\d{1}\b/;
    match = text.match(idPattern2);
    if (match) return match[0];
    
    const idPattern3 = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/;
    match = text.match(idPattern3);
    if (match) return match[0];
    
    const idPattern4 = /\b\d{8,12}\b/;
    match = text.match(idPattern4);
    if (match) return match[0];
    
    return null;
  }

  // 📅 Extract birth date (additional pattern)
  private extractBirthDate(text: string): string | null {
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('birth') || line.includes('birthday') || line.includes('date of birth')) {
        // Check next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const dateMatch = nextLine.match(/\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2}/);
          if (dateMatch) return dateMatch[0];
        }
        // Check same line
        const dateMatch = line.match(/\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2}/);
        if (dateMatch) return dateMatch[0];
      }
    }
    
    return null;
  }

  private extractPosition(text: string): string | null {
    const positions = [
      'DRIVER', 'OPERATOR', 'MECHANIC', 'ENGINEER', 'STAFF', 
      'MANAGER', 'SUPERVISOR', 'TECHNICIAN', 'CONDUCTOR',
      'EMPLOYEE', 'WORKER', 'ASSISTANT', 'CLERK'
    ];
    
    const upperText = text.toUpperCase();
    for (const position of positions) {
      if (upperText.includes(position)) {
        return position;
      }
    }
    
    return null;
  }

  private extractDateOfBirth(text: string): string | null {
    const datePatterns = [
      /\b\d{4}[-/]\d{2}[-/]\d{2}\b/,
      /\b\d{2}[-/]\d{2}[-/]\d{4}\b/
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }

  private extractAddress(text: string): string | null {
    const lines = text.split('\n').map(l => l.trim());
    const addressKeywords = ['ADDRESS', 'ADDR', 'STREET', 'CITY', 'PROVINCE'];
    
    for (let i = 0; i < lines.length; i++) {
      const upperLine = lines[i].toUpperCase();
      if (addressKeywords.some(keyword => upperLine.includes(keyword))) {
        if (i + 1 < lines.length && lines[i + 1].length > 10) {
          return lines[i + 1];
        }
      }
    }
    
    return null;
  }
}