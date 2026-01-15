import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { ChampionshipsService } from '../services/openapi-client/api/championships.service';
import { ChampionshipResponsePagedList, ChampionshipResponse } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateChampionshipRequest, UpdateChampionshipRequest } from '../services/openapi-client/model/models';
import { ChampionshipDialog } from './championship-dialog/championship-dialog';
import { AuthService } from '../core/auth/auth';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-championships',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, MatFormFieldModule ],
  templateUrl: './championships.html',
  styleUrl: './championships.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Championships implements OnInit {
  private championshipsService = inject(ChampionshipsService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private snackbar = inject(MatSnackBar);
  championships = signal<ChampionshipResponsePagedList | null>(null);
  displayedColumns: string[] = ['id', 'name', 'year', 'teamsCount', 'winnerName', 'actions'];
  dataSource = signal<ChampionshipResponse[]>([]);
  currentSortBy: string | null = null;
  currentSortOrder: string = 'asc';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadChampionships(1, 10, null, 'asc');
  }

  onSortChange(sortBy: string): void {
    this.currentSortBy = sortBy;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadChampionships(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  onSortOrderChange(sortOrder: string): void {
    this.currentSortOrder = sortOrder;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadChampionships(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  loadChampionships(pageNumber: number, pageSize: number, sortBy?: string | null, sortOrder?: string): void {
    const finalSortBy = sortBy !== undefined ? sortBy : this.currentSortBy;
    const finalSortOrder = sortOrder !== undefined ? sortOrder : this.currentSortOrder;
    
    this.championshipsService.apiChampionshipsGet(pageNumber, pageSize, undefined, finalSortBy || undefined, finalSortOrder).subscribe(data => {
      this.championships.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any): void {
    this.loadChampionships(event.pageIndex + 1, event.pageSize, this.currentSortBy, this.currentSortOrder);
  }

  openCreateForm(): void {
    const dialogRef = this.dialog.open(ChampionshipDialog, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const createRequest: CreateChampionshipRequest = {
          name: result.name,
          year: result.year,
          winnerId: result.winnerId || null
        };
        this.championshipsService.apiChampionshipsPost(createRequest).subscribe(() => {
          this.loadChampionships(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
        });
         this.snackbar.open('Championship created!', 'close', {
            duration:3000,
            horizontalPosition:'right',
            verticalPosition:'top',
          });
      }
    });
  }

  openEditForm(champ: ChampionshipResponse): void {
    const dialogRef = this.dialog.open(ChampionshipDialog, {
      width: '400px',
      data: champ
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && champ.id) {
        const updateRequest: UpdateChampionshipRequest = {
          name: result.name,
          year: result.year,
          winnerId: result.winnerId || null
        };
        this.championshipsService.apiChampionshipsIdPut(champ.id, updateRequest).subscribe(() => {
          this.loadChampionships(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
        });
         this.snackbar.open('Championship edited!', 'close', {
            duration:3000,
            horizontalPosition:'right',
            verticalPosition:'top',
          });
      }
    });
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this championship?')) {
      this.championshipsService.apiChampionshipsIdDelete(id).subscribe(() => {
        this.loadChampionships(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
      });
       this.snackbar.open('Championship deleted!', 'close', {
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
