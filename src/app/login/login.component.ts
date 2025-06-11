import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

successMessage: string = '';

  name: string= '';
  password: string= '';
  mobile: string= '';
  constructor(private dataService: DataService, private router: Router) {}
  ngOnInit(): void {
  }


  onSubmit() {
  // Store the data in the service
  const formData = {
    name: this.name,
    password: this.password,
    mobile: this.mobile
  };
 this.dataService.setData(formData);

    // Navigate to the next page (show data page)
    this.router.navigate(['/show-data']);

  }
  
}
