import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
  private formData: { name: string, password: string, mobile: string } = { 
    name: '', 
    password: '', 
    mobile: '' 
  }; 
  

  
  setData(data: { name: string, password: string, mobile: string }) {
    this.formData = data;
  }

  getData() {
    return this.formData;
  }
}
