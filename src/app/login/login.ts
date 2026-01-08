import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatSlideToggleModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(private route: Router, private snackbar: MatSnackBar) {}
  userid: string ="";
  password: string ="";
  hasClicked = signal(false);
  autenticated = signal(false);
  errMsg = signal("Autentication failed");
  gestAut(){
    this.hasClicked.set(true);
    console.log("User Id: "+this.userid);
    if (this.userid === "Robert" && this.password==="1234Robi"){
      this.autenticated.set(true);
      this.snackbar.open('hai autenticato bravo', 'chiudi', {
        duration:3000,
        horizontalPosition: 'right', 
        verticalPosition: 'top',
      })
    }else{
      this.autenticated.set(false);
      this.snackbar.open(this.errMsg(), 'chiudi', {
        duration:3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      })
    }

  }
}
