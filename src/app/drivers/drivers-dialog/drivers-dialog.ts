import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { DriverResponse, DriverType, UpdateDriverRequest } from '../../services/openapi-client/model/models';
@Component({
  selector: 'app-drivers-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatSelectModule],
  templateUrl: './drivers-dialog.html',
  styleUrl: './drivers-dialog.css',
})
export class DriversDialog {
  driversForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    nationality: new FormControl('', [Validators.required]),
    driverType: new FormControl('', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    teamId: new FormControl('', [Validators.required])
  });

  constructor(
    public dialogRef: MatDialogRef<DriversDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateDriverRequest | null
  ) {
    if (data) {
      this.driversForm.patchValue({
        firstName: data.firstName,
        lastName: data.lastName,
        nationality: data.nationality,
        driverType: data.driverType,
        teamId: data.teamId,
        dateOfBirth: data.dateOfBirth ? this.formatDate(data.dateOfBirth) : '',
      });
    }
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.driversForm.valid) {
      this.dialogRef.close(this.driversForm.value);
    }
  }
}
