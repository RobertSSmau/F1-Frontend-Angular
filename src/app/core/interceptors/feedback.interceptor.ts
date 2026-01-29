import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const feedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    tap(event => {
      // 200 intercept
      if (event instanceof HttpResponse) {
        let message = '';
        
        switch (req.method) {
        case 'POST':
            message = 'Successfuly created!';
            break;
        case 'PUT':
            message = 'Successfuly modified!';
            break;
        case 'DELETE':
            message = 'Successfuly deleted!';
            break;
        default:
            break;
        }

        if (message) {
          snackBar.open(message, 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Unexpected error';

      // 400 Bad requests
      if (error.status === 400 && error.error?.errors) {
        const valErrors = error.error.errors;
        //array of errors in string
        const messages = Object.values(valErrors).flat() as string[];
        errorMessage = messages.length > 0 ? messages.join('\n') : (error.error.title || 'Notvalid');
      } 
      else if (error.error?.detail) {
        errorMessage = error.error.detail;
      } 
      else if (error.error?.title) {
        errorMessage = error.error.title;
      }
      else if (error.status === 0) {
        errorMessage = 'Server unreachable.';
      }
      else if (error.status === 404) {
        errorMessage = 'Unavailable.';
      }
      else if (error.status === 500) {
        errorMessage = 'Server error.';
      }

      // 401 ignored
      if (error.status !== 401) {
        snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }

      return throwError(() => error);
    })
  );
};
