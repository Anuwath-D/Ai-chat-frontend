import { Component, OnInit } from '@angular/core';
import { ApiService } from './shared/services/api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'ai-chat-frontend';

  constructor(
    private service: ApiService,
  ){}

  ngOnInit(): void {
    this.getForID()
    };

    /////////////API/////////////////////
    getForID(){
      // console.log(this.user_uid);
      // this.isOkLoading = true;
      this.service.getapi().subscribe(
        (res:any) => {
          // this.isOkLoading = false;
          console.log("getforid>>>>",res);
          // console.log("getforidcategory_count>>>>",res.data[0].category_count);
          // this.DataforID = res.data[0].category_count;
        },
        (err:any) => {
          // if(err.status === 403){
          //   this.error('permission denied')
          //   setTimeout(() => {
          //     this.router.navigate(['permission'])
          //   }, 3000);
          // }
          // if (err.status === 404){
          //   this.isOkLoading = false;
          //   this.checkData = false;
          // }
          console.log("getError>>>>",err);
        }
      );
    }
}
