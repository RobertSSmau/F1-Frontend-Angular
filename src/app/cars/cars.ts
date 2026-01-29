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
import { ActivatedRoute, Router } from '@angular/router';
import {
  MatSnackBar,
} from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-cars',
  imports: [ CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
     MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule,
     SearchBarComponent, MatSelectModule, MatFormFieldModule, FormsModule, MatInputModule
    ],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars implements OnInit {
  private snackbar = inject(MatSnackBar)
  private carservice= inject(CarsService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  cars=signal<CarResponsePagedList | null>(null);
  displayColumns: string[] = ['id','model', 'chassisNumber', 'engineManufacturer', 'driverName', 'actions' ];
  dataSource = signal<CarResponse[]>([]);
  currentSortBy: string | null = null;
  currentSortOrder: string = 'asc';
  searchTerm = signal<string>('');
  driverId: string | null = null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.driverId = params['driverId'] || null;
      if (this.driverId) {
        // When coming from driver drill-down, show only the car for that driver
        this.carservice.apiCarsDriverDriverIdGet(this.driverId).subscribe(car => {
          if (car) {
            const pagedList: CarResponsePagedList = {
              items: [car],
              page: 1,
              pageSize: 1,
              totalCount: 1,
              hasNextPage: false,
              hasPreviousPage: false
            };
            this.cars.set(pagedList);
            this.dataSource.set([car]);
          } else {
            this.cars.set({ items: [], page: 1, pageSize: 0, totalCount: 0, hasNextPage: false, hasPreviousPage: false });
            this.dataSource.set([]);
          }
        });
      } else {
        this.loadCars(1, 10, null, 'asc');
      }
    });
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

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadCars(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  loadCars(pageNumber:number, pageSize:number, sortBy?: string | null, sortOrder?: string):void{
    const finalSortBy = sortBy !== undefined ? sortBy : this.currentSortBy;
    const finalSortOrder = sortOrder !== undefined ? sortOrder : this.currentSortOrder;
    
    this.carservice.apiCarsGet(pageNumber, pageSize, this.searchTerm() 
    || undefined, finalSortBy 
    || undefined, finalSortOrder).subscribe(data=> {   
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
