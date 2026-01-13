import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { TeamResponse, CreateTeamRequest, UpdateTeamRequest } from '../../services/openapi-client/model/models';

@Component({
  selector: 'app-teams-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatSelectModule],
  templateUrl: './teams-dialog.html',
  styleUrl: './teams-dialog.css',
})
export class TeamsDialog {
    teamsForm:FormGroup = new FormGroup({
      //'id', 'name', 'country', 'championshipId'
      name: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      championshipId: new FormControl('', [Validators.required])
    });

    constructor(
      public dialogref: MatDialogRef<TeamsDialog>,
      @Inject(MAT_DIALOG_DATA) public data: TeamResponse | null
    ){
      if(data) {
        this.teamsForm.patchValue({
          name: data.name,
          country: data.country,
          championshipId: data,
        });
      }

    }

    onCancel(): void {
    this.dialogref.close();
  }

  onSave(): void {
    if (this.teamsForm.valid) {
      this.dialogref.close(this.teamsForm.value);
    }
  }
    
    

}
