import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { TeamsService } from '../services/openapi-client/api/teams.service';
import { TeamResponse, TeamResponsePagedList } from '../services/openapi-client/model/models';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateTeamRequest, UpdateTeamRequest } from '../services/openapi-client/model/models';
import { TeamsDialog } from './teams-dialog/teams-dialog';
import { AuthService } from '../core/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teams',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './teams.html',
  styleUrl: './teams.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Teams implements OnInit {
  private teamsService=inject(TeamsService);
  private dialog=inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);
  teams = signal<TeamResponsePagedList | null>(null);
  displayColumns: string[] = ['id', 'name', 'country', 'championshipName' , 'driversCount', 'actions'];
  dataSource = signal<TeamResponse[]>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadTeams(1,10);
  }

  loadTeams(pageNumber: number, pageSize: number): void {
    this.teamsService.apiTeamsGet(pageNumber, pageSize).subscribe(data => {
      this.teams.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any):void{
    this.loadTeams(event.pageIndex + 1, event.pageSize);
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
            });
          }
        });
      }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this team?')) {
      this.teamsService.apiTeamsIdDelete(id).subscribe(() => {
        this.loadTeams(1, 10);
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
