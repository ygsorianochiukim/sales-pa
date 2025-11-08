import { Component, OnInit } from '@angular/core';
import { LucideAngularModule , User, LockIcon } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [ LucideAngularModule ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {
  readonly usernameIco = User;
  readonly passwordIco = LockIcon;
  constructor() { }

  ngOnInit() {}

}
