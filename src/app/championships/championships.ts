import { Component, OnInit, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { ChampionshipsService } from '../services/openapi-client/api/championships.service';
import { ChampionshipResponsePagedList, ChampionshipResponse } from '../services/openapi-client/model/models';

@Component({
  selector: 'app-championships',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './championships.html',
  styleUrl: './championships.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Championships implements OnInit {
  private championshipsService = inject(ChampionshipsService);
  championships = signal<ChampionshipResponsePagedList | null>(null);
  displayedColumns: string[] = ['id', 'name', 'year', 'teamsCount', 'winnerName'];
  dataSource = signal<ChampionshipResponse[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadChampionships(1, 10);
  }

  loadChampionships(pageNumber: number, pageSize: number): void {
    this.championshipsService.apiChampionshipsGet(pageNumber, pageSize).subscribe(data => {
      this.championships.set(data);
      this.dataSource.set(data.items ?? []);
    });
  }

  onPageChange(event: any): void {
    this.loadChampionships(event.pageIndex + 1, event.pageSize);
  }
}
