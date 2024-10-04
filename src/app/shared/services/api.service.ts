import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  getToken(){
    let token = localStorage.getItem('token')
    return token !== null ? token: ''
  }

  getheader() {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.get<any>(`/api/v1/chat/history/header`, {
      headers: headers
    })
  }

  getfiles() {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.get<any>(`/api/v1/chat/history/files`, {
      headers: headers
    })
  }

  deleteFile(name: any) {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.delete<any>(`/api/v1/chat/history/files/delete?fileName=${name}`, {
      headers: headers
    })

  }

  gethistory(uid: any) {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.get<any>(`/api/v1/chat/history/detail?uid_chat=${uid}`, {
      headers: headers
    })
  }

  getresponse_chat(body: any) {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.post<any>(`/api/v1/chat/completions`, body, {
      headers: headers
    })
  }

  save_chat(body: any) {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.post<any>(`/api/v1/chat/completions/save`, body , {
      headers: headers
    })
  }

  image_text(formData: any) {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.post<any>(`/api/v1/chat/completions/upload_images`, formData , {
      headers: headers
    })
  }

  upload_file(formData: any) {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.post<any>(`/api/v1/chat/completions/upload_files`, formData , {
      headers: headers
    })
  }

}
