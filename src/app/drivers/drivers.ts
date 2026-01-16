import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DriversService } from '../services/openapi-client/api/drivers.service';
import { DriverResponse, DriverResponsePagedList } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateDriverRequest, UpdateDriverRequest } from '../services/openapi-client/model/models';
import { DriversDialog } from './drivers-dialog/drivers-dialog';
import { AuthService } from '../core/auth/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-drivers',
  imports: [ CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, MatFormFieldModule, FormsModule, MatInputModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drivers implements OnInit {
  private driversService = inject(DriversService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  drivers = signal<DriverResponsePagedList | null>(null);
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'nationality', 'driverType', 'teamName', 'dateOfBirth', 'actions'];
  dataSource = signal<DriverResponse[]>([]);
  currentSortBy: string | null = null;
  currentSortOrder: string = 'asc';
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadDrivers(1, 10, null, 'asc');
  }

  onSortChange(sortBy: string): void {
    this.currentSortBy = sortBy;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadDrivers(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  onSortOrderChange(sortOrder: string): void {
    this.currentSortOrder = sortOrder;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadDrivers(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadDrivers(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  loadDrivers(pageNumber: number, pageSize: number, sortBy?: string | null, sortOrder?: string): void {
    const finalSortBy = sortBy !== undefined ? sortBy : this.currentSortBy;
    const finalSortOrder = sortOrder !== undefined ? sortOrder : this.currentSortOrder;
    
    this.driversService.apiDriversGet(pageNumber, pageSize, this.searchTerm || undefined, finalSortBy || undefined, finalSortOrder).subscribe(data => {
      this.drivers.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any):void{
    this.loadDrivers(event.pageIndex + 1, event.pageSize, this.currentSortBy, this.currentSortOrder);
  }

  openCreateForm(): void {
      const dialogRef = this.dialog.open(DriversDialog, {
        width: '400px',
        data: null
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const createRequest: CreateDriverRequest = {
            firstName: result.firstName,
            lastName: result.lastName,
            nationality: result.nationality,
            dateOfBirth: result.dateOfBirth,
            driverType: result.driverType,
            teamId: result.teamId
          };
          this.driversService.apiDriversPost(createRequest).subscribe(() => {
            this.loadDrivers(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
          });
         this.snackbar.open('Driver created!', 'close', {
            duration:3000,
            horizontalPosition:'right',
            verticalPosition:'top',
          });
      }
    });
  }

  openEditForm(champ: DriverResponse): void {
      const dialogRef = this.dialog.open(DriversDialog, {
        width: '400px',
        data: champ
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && champ.id) {
          const updateRequest: UpdateDriverRequest = {
            firstName: result.firstName,
            lastName: result.lastName,
            nationality: result.nationality,
            dateOfBirth: result.dateOfBirth,
            driverType: result.driverType,
            teamId: result.teamId
          };
          this.driversService.apiDriversIdPut(champ.id, updateRequest).subscribe(() => {
            this.loadDrivers(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
          });
         this.snackbar.open('Driver edited!', 'close', {
            duration:3000,
            horizontalPosition:'right',
            verticalPosition:'top',
          });
      }
    });
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driversService.apiDriversIdDelete(id).subscribe(() => {
        this.loadDrivers(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
      });
      this.snackbar.open("Driver deletion successful!", 'Close', {
        duration: 3000,
        horizontalPosition:'right',
        verticalPosition:'top',
      });
    }
  }
  isAdmin(): boolean {
    const admin = this.authService.hasRole('Admin');
    return admin;
  }
}
