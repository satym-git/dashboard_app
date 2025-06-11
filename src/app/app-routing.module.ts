import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ShowDataComponent } from './show-data/show-data.component';

const routes: Routes = [
   { path: '', component: LoginComponent},
  { path: 'show-data', component: ShowDataComponent },];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
