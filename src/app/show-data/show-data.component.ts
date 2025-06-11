import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeeService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-show-data',
  templateUrl: './show-data.component.html',
  styleUrls: ['./show-data.component.scss']
})
export class ShowDataComponent implements OnInit {

  onExport(): void {
  if (this.gridApi) {
    this.gridApi.exportDataAsCsv({
      fileName: 'company_data.csv',
      processCellCallback: (params: { column: { getColId: () => string; }; value: string | number | Date; }) => {
        if (params.column.getColId() === 'est_date' && params.value) {
          // Format to YYYY-MM-DD
          const date = new Date(params.value);
          return date.toISOString().split('T')[0];
        }
        return params.value;
      },
      columnKeys: this.columnDefs
        .filter(col => col.field !== 'action')  
        .map(col => col.field)
    });
  } 
}

  SignOut() {
    this.router.navigate(['']);
  }

  GetGUID() {
    var chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var str_guid = "";
    for (var i = 0; i < 36; i++) {
      var str_guid = str_guid + ((i == 8 || i == 13 || i == 18 || i == 23) ? "-" : chars[Math.floor(Math.random() * chars.length)]);
    };
    str_guid = str_guid.replace(/-/g, '');
    return str_guid;
  }

  currentDate: string = new Date().toISOString().split('T')[0];
  gridApi: any;

  companies = {
    id: null,
    guid: '',
    Company_code: '',
    Company_name: '',
    gst_no: '',
    contact: '',
    address1: '',
    address2: '',
    state_id: null,
    city: '',
    pincode: '',
    est_date: ''
  };

  rowData: any[] = [];
  updatedRows: any[] = [];
  deletedRows: number[] = [];
  states: any[] = [];

  rowSelection = 'multiple';

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  columnDefs = [
    {
      headerName: '',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      suppressSizeToFit: true
    },
    { headerName: 'Company Code', field: 'Company_code', width: 150 },
    { headerName: 'Company Name', field: 'Company_name', width: 150 },
    { headerName: 'GST No', field: 'gst_no', width: 150 },
    { headerName: 'Contact', field: 'contact', width: 150 },
    { headerName: 'Address1', field: 'address1' },
    { headerName: 'Address2', field: 'address2' },
    {
      headerName: 'State',
      field: 'state_id',
      valueGetter: (params: any) => {
        if (!params.data || params.data.state_id == null) return 'Unknown';
        const state = this.states.find(s => s.state_id == params.data.state_id);
        return state ? state.state_name : 'Unknown';
      }
    },
    { headerName: 'City', field: 'city' },
    { headerName: 'Pincode', field: 'pincode' },
    {
      headerName: 'Est. Date',
      field: 'est_date',
      valueFormatter: (params: any) => {
        return params.value ? new Date(params.value).toISOString().split('T')[0] : '';
      }
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => {
        const e = document.createElement('button');
        e.innerText = 'Delete';
        e.classList.add('btn', 'btn-danger', 'btn-sm');
        e.addEventListener('click', () => {
          this.deleteRows(params.data.id, params.data.guid);
        });
        return e;
      }
    }
  ];

  constructor(private userService: EmployeeService, private router: Router) { }

  ngOnInit(): void {

    this.getStates();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onSelectionChanged(event: any) {
    const selectedRows = event.api.getSelectedRows();
    console.log('Currently selected rows:', selectedRows);
  }

  clearLocalData() {
    localStorage.removeItem('employeeData');
    this.rowData = [];
    if (this.gridApi) {
      this.gridApi.setRowData([]);
    }
  }
  // delete selected rows
  deleteSelectedRows() {
    const selectedRows = this.gridApi.getSelectedRows();

    if (selectedRows.length === 0) {
      alert('Please select rows to delete');
      return;
    }

    const idsToDelete: number[] = [];
    const guidsToDelete: string[] = [];

    selectedRows.forEach((row: any) => {
      if (row.id) idsToDelete.push(row.id);
      else if (row.guid) guidsToDelete.push(row.guid);
    });

    const confirmDelete = confirm(`Are you sure you want to delete ${selectedRows.length} record(s)?`);
    if (!confirmDelete) return;

    this.rowData = this.rowData.filter(
      row => !idsToDelete.includes(row.id) && !guidsToDelete.includes(row.guid)
    );
    this.gridApi.setRowData(this.rowData);

    if (idsToDelete.length > 0) {
      this.userService.deleteEmployees(idsToDelete).subscribe({
        next: () => alert('Deleted successfully!'),
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Error deleting records.');
        }
      });
    }
  }
  // delete rows
  deleteRows(id: number | null, guid?: string) {
    if (id) {
      this.deletedRows.push(id);
      this.rowData = this.rowData.filter(r => r.id !== id);
    } else if (guid) {
      this.rowData = this.rowData.filter(r => r.guid !== guid);
    }

    if (this.gridApi) {
      this.gridApi.setRowData(this.rowData);
    }
  }
  // add employee
  addcompanies(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => control.markAsTouched());
      alert('Please fill out all required fields');
      return;
    }

    const {
      id,
      guid,
      Company_code,
      Company_name,
      gst_no,
      contact,
      address1,
      address2,
      state_id,
      city,
      pincode,
      est_date
    } = this.companies;

    // Required fields validation
    if (!Company_code || !Company_name || !address1  || !city || !pincode) {
      alert('Please fill in all required fields: Company Code, Company Name, Address1, State, City, and Pincode.');
      return;
    }


    const formattedEstDate = est_date ? new Date(est_date).toISOString().split('T')[0] : '';

    const updatedCompany = {
      ...this.companies,
      id: id ?? null,
      guid: this.GetGUID(),
      est_date: formattedEstDate,
      status: this.companies.id ? 'modified' : 'new'
    };

    const index = this.companies.id ? this.rowData.findIndex(e => e.id === this.companies.id) : this.rowData.findIndex(e => e.guid === this.companies.guid);

    if (index !== -1) {

      this.rowData[index] = updatedCompany;
      //  alert('Data is updated in table');

    } else {
      this.rowData.push(updatedCompany);
      //  alert('Data is added to table');
    }
    this.rowData = [...this.rowData];

    this.companies = {
      id: null,
      guid: '',
      Company_code: '',
      Company_name: '',
      gst_no: '',
      contact: '',
      address1: '',
      address2: '',
      state_id: null,
      city: '',
      pincode: '',
      est_date: ''
    };

    this.clearForm(form);
  }


  clearForm(form: NgForm) {
    form.resetForm();
    this.companies = {
      id: null,
      guid: '',
      Company_code: '',
      Company_name: '',
      gst_no: '',
      contact: '',
      address1: '',
      address2: '',
      state_id: null,
      city: '',
      pincode: '',
      est_date: ''
    };
  }

  onRowDoubleClick(event: any) {
    const data = { ...event.data };

    if (data.est_date) {
      data.est_date = new Date(data.est_date).toISOString().split('T')[0];
    }

    this.companies = data;
  }


  //get state from backend
  getStates(): void {
    this.userService.getStates().subscribe({
      next: (data: any) => {
        this.states = data;
        this.loadEmployeeData();
      },
      error: (err) => console.error('Error loading states', err)
    });
  }
  // load the employee
  loadEmployeeData(): void {
    this.userService.getEmployees().subscribe({
      next: (data) => {
        this.rowData = data.map((emp: any) => ({
          ...emp,
          status: 'unchanged'
        }));
      },
      error: (err) => console.error('Error loading employees', err)
    });
  }
  // to save the data
  save() {
    const dataToSend = this.rowData
      .filter(row => row.status === 'new' || row.status === 'modified')
      .map(row => ({
        id: row.id !== undefined ? row.id : null,
        Company_code: row.Company_code,
        Company_name: row.Company_name,
        gst_no: row.gst_no,
        contact: row.contact,
        address1: row.address1,
        address2: row.address2,
        state_id: row.state_id,
        city: row.city,
        pincode: row.pincode,
        est_date: row.est_date ? new Date(row.est_date).toISOString().split('T')[0] : null
      }));

    const saveToDB = () => {
      if (dataToSend.length === 0) {
        alert('No new or modified data to save.');
        return;
      }

      this.userService.addEmployeeToDB(dataToSend).subscribe({
        next: () => {
          alert('Data saved to database!');
          this.rowData = this.rowData.map(row => ({ ...row, status: 'unchanged' }));
          localStorage.setItem('companyData', JSON.stringify(this.rowData));
        },
        error: err => {
          console.error('Error saving data!', err);
          alert('Failed to save data.');
        }

      });
    };

    if (this.deletedRows.length > 0) {
      this.userService.deleteEmployees(this.deletedRows).subscribe({
        next: () => {
          console.log('Deleted IDs:', this.deletedRows);
          this.deletedRows = [];
          alert('Data deleted successfully');
          //saveToDB();
        },
        error: err => {
          console.error('Error deleting data:', err);
          alert('Failed to delete records.');
        }
      });
    } else {
      saveToDB();
    }
  }

}