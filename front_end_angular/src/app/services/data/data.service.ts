import { BadInput } from '../../components/common/bad-input';
import { NotFoundError } from '../../components/common/not-found-error';
import { UnauthorizedError } from '../../components/common/unauthorized-error';
import { AppError } from '../../components/common/app-error';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';

export class DataService {

  constructor(protected url: string, protected http: HttpClient) { }

  protected handleError(error: Response){
    if(error.status === 400)
      return throwError(new BadInput());

    if(error.status === 404)
      return throwError(new NotFoundError());

    if(error.status === 401)
      return throwError(new UnauthorizedError());

    return throwError(new AppError(error));
  }
}
