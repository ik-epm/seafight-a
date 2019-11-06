import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';


import { AdviceInterface } from 'src/app/interfaces/advice.interface';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor( private http: HttpClient ) { }

  getShipsData() {
    return this.http.get('/assets/configs.json')
  }

  getAdvicesData(): Observable<{preGameAdvices?: Array<any>, gameAdvices?: Array<any>}> {
    return this.http.get('/assets/advices.json')
  }
}
