import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule , User, LockIcon } from 'lucide-angular';
import { AuthServices } from 'src/app/Services/auth/auth';
import { IonText } from "@ionic/angular/standalone";
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-login',
  imports: [IonicModule,  LucideAngularModule , CommonModule , FormsModule , HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthServices]
})
export class LoginComponent  implements OnInit {
  readonly usernameIco = User;
  readonly passwordIco = LockIcon;

  emailOrUsername = '';
  password = '';
  errorMessage = '';
  loading = false;
  constructor(private AuthServices : AuthServices , private storage: Storage,private router: Router) { }

  async ngOnInit() {
    await this.storage.create();
    const user = await this.storage.get('User');
    const token = await this.storage.get('token');
    if (user && token) {
      this.router.navigate(['/home']);
    } 
  }

  login() {
    this.errorMessage = '';
    this.loading = true;

    this.AuthServices.login(this.emailOrUsername, this.password).subscribe({
      next: async (res) => {
        this.loading = false;
        await this.storage.set('session', res);
        this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed';
      }
    });
  }

}
