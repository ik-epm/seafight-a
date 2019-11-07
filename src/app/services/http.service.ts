import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AdvicesInterface } from '../interfaces/advices.interface';
import { ConfigsInterface } from '../interfaces/configs.interface';

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  getShipsData(): Observable<ConfigsInterface> {
    return this.http.get('/assets/configs.json');
  }

  getAdvicesData(): Observable<AdvicesInterface> {
    return this.http.get('/assets/advices.json');
  }
}
