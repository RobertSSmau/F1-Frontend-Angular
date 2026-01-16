import { Component, Inject, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CarResponse, UpdateCarRequest } from '../../services/openapi-client/model/models';

@Component({
  selector: 'app-cars-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatSelectModule],
  templateUrl: './cars-dialog.html',
  styleUrl: './cars-dialog.css',
})
export class CarsDialog {
  carsForm: FormGroup = new FormGroup({
    model: new FormControl('', [Validators.required]),
    chassisNumber: new FormControl('', [Validators.required]),
    engineManufacturer: new FormControl('', [Validators.required]),
    driverId: new FormControl(''),
  });

  constructor(
    public dialogRef: MatDialogRef<CarsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateCarRequest | null
  ){
    if(data){
      this.carsForm.patchValue({
        model: data.model,
        chassisNumber: data.chassisNumber,
        engineManufacturer : data.engineManufacturer,
        driverId: data.driverId,
      })
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.carsForm.valid) {
      this.dialogRef.close(this.carsForm.value);
    }
  }
}
