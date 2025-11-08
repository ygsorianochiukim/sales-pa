import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Views/home/home.component';
import { CustomerComponent } from './Views/customer/customer.component';
import { SalesPAComponent } from './Views/sales-pa/sales-pa.component';
import { PaymentsComponent } from './Views/payments/payments.component';
import { SubsequentComponent } from './Views/subsequent/subsequent.component';
import { ScanIDComponent } from './Views/scan-id/scan-id.component';
import { PaymentTaggingComponent } from './Views/payment-tagging/payment-tagging.component';
import { PaymentScanComponent } from './Views/payments/payment-scan/payment-scan.component';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [
  {path:'',redirectTo: 'login' , pathMatch:'full'},
  {path:'login',component:LoginComponent},
  {path:'home',component:HomeComponent},
  {path:'customer',component:CustomerComponent},
  {path:'purchase',component:SalesPAComponent},
  {path:'payment',component:PaymentsComponent},
  {path:'subsequent',component:SubsequentComponent},
  {path:'scan',component:ScanIDComponent},
  {path:'firstPayment',component:PaymentTaggingComponent},
  {path:'scanPayment',component:PaymentScanComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
