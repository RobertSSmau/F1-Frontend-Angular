import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChampionshipResponse } from '../../services/openapi-client/model/models';

@Component({
  selector: 'app-championship-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  templateUrl: './championship-dialog.html',
  styleUrl: './championship-dialog.css',
})
export class ChampionshipDialog {
  championshipForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    year: new FormControl('', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]),
    winnerId: new FormControl('')
  });

  constructor(
    public dialogRef: MatDialogRef<ChampionshipDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ChampionshipResponse | null
  ) {
    if (data) {
      this.championshipForm.patchValue({
        name: data.name,
        year: data.year,
        winnerId: data.winnerId
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.championshipForm.valid) {
      this.dialogRef.close(this.championshipForm.value);
    }
  }
}
