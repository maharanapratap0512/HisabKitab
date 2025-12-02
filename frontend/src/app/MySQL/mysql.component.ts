import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { ApiService } from '../services/api.service';
import { GlobalService } from '../services/global.service';

interface Database {
  name: string;
}

interface Procedure {
  procedure_name: string;
  type: string;
  created_date: string;
  last_modified: string;
  parameters?: Parameter[];
}

interface Parameter {
  name: string;
  mode: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
}

interface TableColumn {
  name: string;
  type: number;
  length?: number;
  flags?: number;
}

@Component({
  selector: 'app-mysql',
  templateUrl: './mysql.component.html',
  styleUrls: ['./mysql.component.scss']
})
export class MysqlComponent implements OnInit, OnDestroy {
  connectionForm: FormGroup;
  isConnected = false;
  isLoading = false;
  connectionId: string = '';
  databases: Database[] = [];
  procedures: Procedure[] = [];
  selectedDatabase = '';
  selectedProcedure = '';
  procedureResults: any[] = [];
  tableColumns: TableColumn[] = [];
  errorMessage = '';
  selectedProcedureData: Procedure | null = null;
  parameterValues: { [key: string]: any } = {};

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private apiService: ApiService,
    private globalService: GlobalService
  ) {
    this.connectionForm = this.fb.group({
      host: ['localhost', [Validators.required]],
      user: ['root', [Validators.required]],
      password: ['123', [Validators.required]],
      port: ['3306', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Close connection when component is destroyed
    if (this.connectionId) {
      this.closeConnection();
    }
  }

  testConnection(): void {
    if (this.connectionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const connectionData = this.connectionForm.value;

    this.httpService.post(this.apiService.getUrl('BASE') + 'mysql/test-connection', connectionData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.globalService['toastr'].success('Connection successful!');
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Connection failed';
      }
    });
  }

  connect(): void {
    if (this.connectionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const connectionData = this.connectionForm.value;

    this.httpService.post(this.apiService.getUrl('BASE') + 'mysql/databases', connectionData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.isConnected = true;
          this.databases = response.data;
          this.connectionId = response.connectionId;
          this.globalService['toastr'].success('Connected successfully!');
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Connection failed';
      }
    });
  }

  onDatabaseChange(): void {
    if (!this.selectedDatabase || !this.connectionId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.procedures = [];
    this.selectedProcedure = '';

    this.httpService.post(this.apiService.getUrl('BASE') + `mysql/procedures/${this.connectionId}`, {
      database: this.selectedDatabase
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.procedures = response.data;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load procedures';
      }
    });
  }

  onProcedureChange(): void {
    this.selectedProcedureData = this.procedures.find(p => p.procedure_name === this.selectedProcedure) || null;
    this.parameterValues = {};
    
    // Initialize parameter values
    if (this.selectedProcedureData?.parameters) {
      this.selectedProcedureData.parameters.forEach(param => {
        this.parameterValues[param.name] = this.getDefaultValueForType(param.type);
      });
    }
  }

  private getDefaultValueForType(type: string): any {
    const upperType = type.toUpperCase();
    if (upperType.includes('INT') || upperType.includes('DECIMAL') || upperType.includes('NUMERIC')) {
      return 0;
    } else if (upperType.includes('VARCHAR') || upperType.includes('TEXT') || upperType.includes('CHAR')) {
      return '';
    } else if (upperType.includes('DATE') || upperType.includes('TIME')) {
      return new Date().toISOString().split('T')[0];
    } else if (upperType.includes('BIT') || upperType.includes('BOOL')) {
      return false;
    }
    return '';
  }

  public isTextType(type: string): boolean {
    const upperType = type.toUpperCase();
    return upperType.includes('VARCHAR') || upperType.includes('TEXT') || upperType.includes('CHAR');
  }

  public isNumberType(type: string): boolean {
    const upperType = type.toUpperCase();
    return upperType.includes('INT') || upperType.includes('DECIMAL') || upperType.includes('NUMERIC') || upperType.includes('FLOAT') || upperType.includes('DOUBLE');
  }

  public isDateType(type: string): boolean {
    const upperType = type.toUpperCase();
    return upperType.includes('DATE') || upperType.includes('TIME') || upperType.includes('DATETIME');
  }

  public isBooleanType(type: string): boolean {
    const upperType = type.toUpperCase();
    return upperType.includes('BIT') || upperType.includes('BOOL') || upperType.includes('BOOLEAN');
  }

  executeProcedure(): void {
    if (!this.selectedProcedure || !this.connectionId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Convert parameter values to array in correct order
    const parameters = this.selectedProcedureData?.parameters?.map(param => this.parameterValues[param.name]) || [];

    this.httpService.post(this.apiService.getUrl('BASE') + `mysql/execute/${this.connectionId}`, {
      procedureName: this.selectedProcedure,
      parameters: parameters
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.procedureResults = response.results;
          this.globalService['toastr'].success(`Procedure executed successfully.`);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to execute procedure';
      }
    });
  }

  disconnect(): void {
    this.closeConnection();
    this.resetForm();
  }

  private closeConnection(): void {
    if (this.connectionId) {
      this.httpService.delete(this.apiService.getUrl('BASE') + `mysql/connection/${this.connectionId}`).subscribe({
        next: () => {
          console.log('Connection closed');
        },
        error: (error: any) => {
          console.error('Error closing connection:', error);
        }
      });
    }
  }

  private resetForm(): void {
    this.isConnected = false;
    this.connectionId = '';
    this.databases = [];
    this.procedures = [];
    this.selectedDatabase = '';
    this.selectedProcedure = '';
    this.procedureResults = [];
    this.tableColumns = [];
    this.errorMessage = '';
    this.selectedProcedureData = null;
    this.parameterValues = {};
  }

  private markFormGroupTouched(): void {
    Object.keys(this.connectionForm.controls).forEach(key => {
      const control = this.connectionForm.get(key);
      control?.markAsTouched();
    });
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
