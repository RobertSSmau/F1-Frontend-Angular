import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TeamsService } from '../services/openapi-client/api/teams.service';
import { TeamResponse, TeamResponsePagedList } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateTeamRequest, UpdateTeamRequest } from '../services/openapi-client/model/models';
import { TeamsDialog } from './teams-dialog/teams-dialog';
import { AuthService } from '../core/auth/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-teams',
  imports: [ CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule, MatSelectModule, MatFormFieldModule, FormsModule, MatInputModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Teams implements OnInit {
  private teamsService=inject(TeamsService);
  private dialog=inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackbar = inject(MatSnackBar);
  teams = signal<TeamResponsePagedList | null>(null);
  displayColumns: string[] = ['id', 'name', 'country', 'championshipName' , 'driversCount', 'actions'];
  dataSource = signal<TeamResponse[]>([]);
  currentSortBy: string | null = null;
  currentSortOrder: string = 'asc';
  searchTerm: string = '';
  championshipId: string | null = null;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.championshipId = params['championshipId'] || null;
      this.loadTeams(1, 10, null, 'asc');
    });
  }

  onSortChange(sortBy: string): void {
    this.currentSortBy = sortBy;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadTeams(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  onSortOrderChange(sortOrder: string): void {
    this.currentSortOrder = sortOrder;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadTeams(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadTeams(1, this.paginator?.pageSize || 10, this.currentSortBy, this.currentSortOrder);
  }

  loadTeams(pageNumber: number, pageSize: number, sortBy?: string | null, sortOrder?: string): void {
    const finalSortBy = sortBy !== undefined ? sortBy : this.currentSortBy;
    const finalSortOrder = sortOrder !== undefined ? sortOrder : this.currentSortOrder;
    
    if (this.championshipId) {
      // Load teams filtered by championship
      this.teamsService.apiTeamsChampionshipChampionshipIdGet(this.championshipId, pageNumber, pageSize).subscribe(data => {
        this.teams.set(data);
        this.dataSource.set(data.items ?? []);
      });
    } else {
      // Load all teams
      this.teamsService.apiTeamsGet(pageNumber, pageSize, this.searchTerm || undefined, finalSortBy || undefined, finalSortOrder).subscribe(data => {
        this.teams.set(data);
        this.dataSource.set(data.items ?? []);
      });
    }
  }

  onPageChange(event: any):void{
    this.loadTeams(event.pageIndex + 1, event.pageSize, this.currentSortBy, this.currentSortOrder);
  }

  onRowClick(team: TeamResponse): void {
    if (team.id && this.championshipId) {
      this.router.navigate(['/drivers'], { 
        queryParams: { 
          teamId: team.id,
          championshipId: this.championshipId,
          pageNumber: 1,
          pageSize: 10
        } 
      });
    }
  }

  openCreateForm(): void {
        const dialogRef = this.dialog.open(TeamsDialog, {
          width: '400px',
          data: null
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            const createRequest: CreateTeamRequest = {
              name: result.name,
              country: result.country,
              championshipId: result.championshipId,
            };
            this.teamsService.apiTeamsPost(createRequest).subscribe(() => {
              this.loadTeams(1, 10);
              this.snackbar.open('Team created!', 'close', {
                duration:3000,
                horizontalPosition:'right',
                verticalPosition:'top',
              });
            });
          }
        });
      }
  
    openEditForm(team: TeamResponse): void {
        const dialogRef = this.dialog.open(TeamsDialog, {
          width: '400px',
          data: team
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if (result && team.id) {
            const updateRequest: UpdateTeamRequest = {
              name: result.name,
              country: result.country,
              championshipId: result.championshipId,
            };
            this.teamsService.apiTeamsIdPut(team.id, updateRequest).subscribe(() => {
              this.loadTeams(1, 10);
              this.snackbar.open('Team edited!', 'close', {
                duration:3000,
                horizontalPosition:'right',
                verticalPosition:'top',
              });
            });
          }
        });
      }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this team?')) {
      this.teamsService.apiTeamsIdDelete(id).subscribe(() => {
        this.loadTeams(1, 10);
        this.snackbar.open('Team deleted!', 'close', {
          duration:3000,
          horizontalPosition:'right',
          verticalPosition:'top',
        });
      });
    }
  }
  isAdmin(): boolean {
    const admin = this.authService.hasRole('Admin');
    return admin;
  }

}
