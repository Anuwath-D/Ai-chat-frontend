import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/shared/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private service: LoginService,) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]] // เช็คว่าเป็น email และไม่ว่างเปล่า
    });
  }

  emailForm: FormGroup;


  username = ''
  password = ''
  api_keys = ''
  email_name = ''
  corfirm_password = ''
  hide_password = false
  hide_cornfirmpassword = false
  user_register = false
  check_password = false
  text_errpassword = false
  text_erremail = false
  login_errormsg = ''

  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {

    event.preventDefault();
    
    let login_btn = document.getElementById('login_btn')
    if (login_btn !== null){
      login_btn.click()
    }

    let register_btn = document.getElementById('register_btn')
    if (register_btn !== null){
      register_btn.click()
    }

  }

  ngOnInit(): void {
    this.hide_password = true
    this.hide_cornfirmpassword = true

  }

  open_hiddenpassword(check: any, state: any) {
    if (state == 1) {
      this.hide_password = check
    }
    if (state == 2) {
      this.hide_cornfirmpassword = check
    }

  }

  open_register(check: any) {
    this.user_register = check
    this.username = ''
    this.password = ''
    this.api_keys = ''
    this.corfirm_password = ''
    this.text_erremail = false
    this.text_errpassword = false
    this.emailForm.get('email')?.setValue('')
    console.log('emailForm',this.emailForm.value.email);
  }

  check_Password() {
    if (this.password && this.corfirm_password) {
      if (this.password === this.corfirm_password) {
        this.text_errpassword = false
        this.check_password = true
        console.log('Check Pass');
      } else {
        this.text_errpassword = true
        this.check_password = false
        console.log('Passwords do not match');
      }

    } else {
      this.check_password = false
      this.text_errpassword = false
    }
    console.log('password', this.password);
    console.log('password', this.corfirm_password);
  }

  check_Email() {
    this.submitForm()
  }

  get email() {
    return this.emailForm.get('email');
  }

  submitForm() {
    console.log('emailForm',this.emailForm.value.email);
    
    if (this.email?.value) {
      if (this.emailForm.valid) {
        console.log('Email ถูกต้อง:', this.email?.value);
        this.text_erremail = false
      } else {
        console.log('รูปแบบอีเมลไม่ถูกต้อง');
        this.text_erremail = true
      }
    }else{
      this.text_erremail = false
    }

  }

  goto_chatcompletions(){
    this.username = ''
    this.password = ''
    this.api_keys = ''
    this.corfirm_password = ''
    this.text_erremail = false
    this.text_errpassword = false
    this.emailForm.get('email')?.setValue('')
    console.log('emailForm',this.emailForm.value.email);
    this.router.navigate([`chat`]);
  }

  register(){
    let body = {
      Username : this.username, 
      password : this.password, 
      email : this.email?.value, 
      api_key : this.api_keys,
    }
    this.service.register(body).subscribe(
      (res: any) => {
        console.log('res',res);
        this.open_register(false)
      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }

  login(){
    let body = {
      Username : this.username, 
      password : this.password,
    }
    this.service.login(body).subscribe(
      (res: any) => {
        console.log('res',res);
        this.goto_chatcompletions()
        this.login_errormsg = ''
        let token = res.token
        localStorage.setItem("token", token);
      },
      (err: any) => {
        console.log("getError>>>>", err.error.message);
        this.login_errormsg = err.error.message
      }
    );
  }

}
