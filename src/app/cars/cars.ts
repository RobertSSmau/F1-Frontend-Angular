import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { CarsService} from '../services/openapi-client/api/cars.service';
import { CarResponse, CarResponsePagedList } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateCarRequest, UpdateCarRequest } from '../services/openapi-client/model/models';
import { CarsDialog } from './cars-dialog/cars-dialog';
import { AuthService } from '../core/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cars',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars {
  private carservice= inject(CarsService);
  //private dialog
  private authService = inject(AuthService);
  private router = inject(Router);
  cars=signal<CarResponsePagedList | null>(null);
  displayColumns: string[] = ['id','model', 'chassisNumber', 'engineManufacturer', 'driverName' ];
  dataSource = signal<CarResponse[]>([]);
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadCars(1,10);
  }

  loadCars(pageNumber:number, pageSize:number):void{
    this.carservice.apiCarsGet(pageNumber, pageSize).subscribe(data=> {
      this.cars.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any):void{
    this.loadCars(event.pageIndex + 1, event.pageSize);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this car?')) {
      this.carservice.apiCarsDriverDriverIdGet(id).subscribe(() => {
        this.loadCars(1, 10);
      });
    }
  }
  isAdmin(): boolean {
    const admin = this.authService.hasRole('Admin');
    return admin;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
}
