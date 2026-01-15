import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { CarsService} from '../services/openapi-client/api/cars.service';
import { CarResponse, CarResponsePagedList } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateCarRequest, UpdateCarRequest } from '../services/openapi-client/model/models';
import { CarsDialog } from './cars-dialog/cars-dialog';
import { AuthService } from '../core/auth/auth';
import {
  MatSnackBar,
} from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-cars',
  imports: [ CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
     MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, MatFormFieldModule
    ],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars implements OnInit {
  private snackbar = inject(MatSnackBar)
  private carservice= inject(CarsService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  cars=signal<CarResponsePagedList | null>(null);
  displayColumns: string[] = ['id','model', 'chassisNumber', 'engineManufacturer', 'driverName', 'actions' ];
  dataSource = signal<CarResponse[]>([]);
  currentSortBy: string | null = null;
  currentSortOrder: string = 'asc';
    @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadCars(1,10, null, 'asc');
  }

  onSortChange(sortBy: string): void {
    this.currentSortBy = sortBy;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadCars(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  onSortOrderChange(sortOrder: string): void {
    this.currentSortOrder = sortOrder;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadCars(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  loadCars(pageNumber:number, pageSize:number, sortBy?: string | null, sortOrder?: string):void{
    const finalSortBy = sortBy !== undefined ? sortBy : this.currentSortBy;
    const finalSortOrder = sortOrder !== undefined ? sortOrder : this.currentSortOrder;
    
    this.carservice.apiCarsGet(pageNumber, pageSize, undefined, finalSortBy || undefined, finalSortOrder).subscribe(data=> {   
      this.cars.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any):void{
    this.loadCars(event.pageIndex + 1, event.pageSize, this.currentSortBy, this.currentSortOrder);
  }

 openCreateForm(): void {
      const dialogRef = this.dialog.open(CarsDialog, {
        width: '400px',
        data: null
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const createRequest: CreateCarRequest = {
          model: result.model,
          chassisNumber: result.chassisNumber,
          engineManufacturer: result.engineManufacturer
          };
          this.carservice.apiCarsPost(createRequest).subscribe(() => {
            this.loadCars(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
          });
          this.snackbar.open('Car created!', 'close', {
            duration:3000,
            horizontalPosition:'right',
            verticalPosition:'top',
          })
        }
      });
    }

  openEditForm(champ: CarResponse): void {
      const dialogRef = this.dialog.open(CarsDialog, {
        width: '400px',
        data: champ
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && champ.id) {
          const updateRequest: UpdateCarRequest = {
            model: result.model,
            chassisNumber: result.chassisNumber,
            engineManufacturer: result.engineManufacturer
          };
          this.carservice.apiCarsIdPut(champ.id, updateRequest).subscribe(() => {
            this.loadCars(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
          });
          this.snackbar.open('Car edited!', 'close', {
            duration:3000,
            horizontalPosition:'right',
            verticalPosition:'top',
          });
        }
      });
    }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this car?')) {
      this.carservice.apiCarsDriverDriverIdGet(id).subscribe(() => {
        this.loadCars(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
      });
      this.snackbar.open('Car deleted!', 'close', {
            duration:3000,
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
