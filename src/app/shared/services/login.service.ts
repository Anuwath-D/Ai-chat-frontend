import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient
  ) { }

  register(body:any){
    return this.http.post<any>(`/api/v1/auth/register` , body)
  }

  login(body:any){
    return this.http.post<any>(`/api/v1/auth/login` , body)
  }


}
