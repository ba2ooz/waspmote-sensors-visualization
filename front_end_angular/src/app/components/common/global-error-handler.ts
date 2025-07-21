import { AppError } from './app-error';
import { ErrorHandler, Injectable } from "@angular/core";

@Injectable()
export class AppErrorHandler implements ErrorHandler{
    handleError(error: AppError){
         alert("Unexpected Error: " + error.originalError['message']);
         console.log(error.originalError);
    };
}