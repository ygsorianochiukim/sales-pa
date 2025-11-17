import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServices } from 'src/app/Services/auth/auth';

@Component({
  selector: 'app-settings',
  imports: [ HttpClientModule ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [AuthServices]
})
export class SettingsComponent  implements OnInit {

  ID: number = 0;

  constructor(private actRoute: ActivatedRoute , private AuthServices : AuthServices,private ngZone: NgZone,private route: Router) { }

  ngOnInit() {
    this.ID = Number(this.actRoute.snapshot.paramMap.get('id'));
  }

  logout(){
    this.AuthServices.logout().subscribe(() => {
      this.ngZone.run(() => this.route.navigate(['/']));
    });
  }

}
