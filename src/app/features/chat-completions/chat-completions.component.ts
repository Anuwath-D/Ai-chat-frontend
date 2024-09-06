import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import hljs from 'highlight.js';
declare var Prism: any;
import { ApiService } from 'src/app/shared/services/api.service';

import 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


// ลงทะเบียนภาษา
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);


@Component({
  selector: 'app-chat-completions',
  templateUrl: './chat-completions.component.html',
  styleUrls: ['./chat-completions.component.sass']
})
export class ChatCompletionsComponent implements OnInit {
  title = 'ai-chat-frontend';

  historydata: Array<any> = [] as Array<any>;
  headerdata: Array<any> = [] as Array<any>;
  isChatuid: { [uid: number]: boolean } = {};
  inputRemarkapproved: string = '';
  savechat_onweb: Array<any> = [] as Array<any>;
  messages: Array<any> = [] as Array<any>;  // เก็บข้อความสนทนา
  isloading = false

  constructor(
    private service: ApiService,
    private el: ElementRef,
    private sanitizer: DomSanitizer
  ) { this.setupMarked(); }


  setupMarked() {
    const renderer: any = new marked.Renderer();

    renderer.code = (code: any, language: any | undefined) => {
      console.log('Supported languages:', hljs.listLanguages());
      language = code.lang;
      console.log("Language:", language);
      console.log("Code:", code);

      // ตรวจสอบภาษาที่ใช้
      const validLang = !!(language && hljs.getLanguage(language));
      console.log('Is valid language:', validLang);

      // ไฮไลต์โค้ด
      let highlighted: any

      if (validLang) {
        // ใช้ highlight.js เพื่อไฮไลต์โค้ด
        const result = hljs.highlight(code.text, { language });
        highlighted = result.value;
      } else {
        highlighted = this.escapeHtml(code.text);
      }


      return `
      <div class="code-block">
        <pre><code class="hljs ${language}">${highlighted}</code></pre>
        <div class="copy-code-btn" @click="handleCopyCode" title="Copy code">
          <svg fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
          </svg>
        </div>
      </div>
    `;
    };

    marked.setOptions({ renderer });
  }

  formatMarkdownToHTML(text: string): SafeHtml {
    const html: any = marked(text);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  escapeHtml(text: any): string {
    if (typeof text !== 'string') {
      return ''; // Handle non-string input
    }

    return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }



  ngOnInit(): void {
    this.getHeader()
  };

  /////////////API/////////////////////

  getHeader() {
    this.service.getheader().subscribe(
      (res: any) => {
        // this.isOkLoading = false;

        this.headerdata = res.data
        console.log("header>>>>", this.headerdata);
      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }

  getHistory(uid: any) {
    // this.isOkLoading = true;
    this.service.gethistory(uid).subscribe(
      (res: any) => {
        this.historydata = res.data
        console.log("history>>>>", this.historydata);
      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }

  selectHistory(uid: any) {
    console.log('uid', uid);
    this.getHistory(uid)

    this.historydata.forEach((element: any) => {
      if (element.uid == uid) {
        this.isChatuid[element.uid] = true
      } else {
        this.isChatuid[element.uid] = false
      }
    });

  }

  message(e: any) {
    console.log('e', e);
    let data = this.inputRemarkapproved
    console.log('data', data);
    let chat_msg =  {
      role : 'user',
      content : data
  }
    if (e.isTrusted && e.type == "click") {
      this.messages.push(chat_msg);  // เพิ่มข้อความไปยังรายการข้อความ
      this.inputRemarkapproved = '';  // ล้างข้อความใน textarea
      this.getResponse_chat(data)
    }
    if (e.isTrusted && e.type == "keydown") {
      e.preventDefault(); // ป้องกันไม่ให้ขึ้นบรรทัดใหม่เมื่อกด Enter
      this.messages.push(chat_msg);  // เพิ่มข้อความไปยังรายการข้อความ
      this.inputRemarkapproved = '';  // ล้างข้อความใน textarea
      this.getResponse_chat(data)
    }
    this.inputRemarkapproved = '';
  }

  getResponse_chat(input: any) {
    let body = {
      model: "default",
      messages: [
        {
          role: "user",
          content: input
        }
      ],
      stream: true
    }
    this.isloading = true
    this.service.getresponse_chat(body).subscribe(
      (res: any) => {
        // this.historydata = res.data
        console.log("res_getResponse_chat>>>>", res);
        let chat_msg =  {
          role : 'model',
          content : res.data
      }
        this.messages.push(chat_msg);
        console.log('this.messages',this.messages);
        this.isloading = false
      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }


}

