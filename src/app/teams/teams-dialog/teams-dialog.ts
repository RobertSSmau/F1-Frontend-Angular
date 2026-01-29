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
      name: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      championshipId: new FormControl('', [Validators.required])
    });

    constructor(
      public dialogref: MatDialogRef<TeamsDialog>,
      @Inject(MAT_DIALOG_DATA) public data: any
    ){
      if (this.data.isEdit) {
        this.teamsForm.patchValue({
          name: this.data.team.name,
          country: this.data.team.country,
          championshipId: this.data.team.championshipId,
        });
      } else {
        this.teamsForm.patchValue({
          championshipId: this.data.championshipId,
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
