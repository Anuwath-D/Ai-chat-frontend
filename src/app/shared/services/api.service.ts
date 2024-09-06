import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  
  getheader(){
    return this.http.get<any>(`/api/v1/chat/history/header`)
  }

  gethistory(uid:any){
    return this.http.get<any>(`/api/v1/chat/history/detail?uid=${uid}`)
  }

  getresponse_chat(body:any){
    return this.http.post<any>(`/api/v1/chat/completions` , body)
  }

}
