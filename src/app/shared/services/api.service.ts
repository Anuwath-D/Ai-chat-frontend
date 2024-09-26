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

  getfiles(){
    return this.http.get<any>(`/api/v1/chat/history/files`)
  }

  deleteFile(name:any){
    return this.http.delete<any>(`/api/v1/chat/history/files/delete?fileName=${name}`)

  }

  gethistory(uid:any){
    return this.http.get<any>(`/api/v1/chat/history/detail?uid=${uid}`)
  }

  getresponse_chat(body:any){
    return this.http.post<any>(`/api/v1/chat/completions` , body)
  }

  save_chat(body:any){
    return this.http.post<any>(`/api/v1/chat/completions/save` , body)
  }

  image_text(formData:any){
    return this.http.post<any>(`/api/v1/chat/completions/upload_images` , formData)
  }

  upload_file(formData:any){
    return this.http.post<any>(`/api/v1/chat/completions/upload_files` , formData)
  }

}
