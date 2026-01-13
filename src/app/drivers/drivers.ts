import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { DriversService } from '../services/openapi-client/api/drivers.service';
import { DriverResponse, DriverResponsePagedList } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateDriverRequest, UpdateDriverRequest } from '../services/openapi-client/model/models';
import { DriversDialog } from './drivers-dialog/drivers-dialog';
import { AuthService } from '../core/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-drivers',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drivers implements OnInit {
  private driversService = inject(DriversService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);
  drivers = signal<DriverResponsePagedList | null>(null);
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'nationality', 'driverType', 'teamName', 'dateOfBirth', 'actions'];
  dataSource = signal<DriverResponse[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadDrivers(1, 10);
  }

  loadDrivers(pageNumber: number, pageSize: number): void {
    this.driversService.apiDriversGet(pageNumber, pageSize).subscribe(data => {
      this.drivers.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any):void{
    this.loadDrivers(event.pageIndex +1, event.pageSize);
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
            this.loadDrivers(1, 10);
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
            this.loadDrivers(1, 10);
          });
        }
      });
    }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driversService.apiDriversIdDelete(id).subscribe(() => {
        this.loadDrivers(1, 10);
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
