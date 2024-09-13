import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class ChatCompletionsComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'ai-chat-frontend';

  historydata: Array<any> = [] as Array<any>;
  uid_chat = ''
  headerdata: Array<any> = [] as Array<any>;
  isChatuid: { [uid: number]: boolean } = {};
  input_chat: string = '';
  savechat_onweb: Array<any> = [] as Array<any>;
  messages: Array<any> = [] as Array<any>;  // เก็บข้อความสนทนา
  isloading = false
  isShowScrollToBottomBtn = false
  shouldScrollChatBodyToBottom = false
  prevScrollHeight: number = 0;
  fix_scrollbug = 0
  start_heightchat = 78
  height_chat = 0
  height_text = 0
  windowInnerWidth : any
  checkmessage = false
  header_chattext = ''
  select_newchat = false

  constructor(
    private service: ApiService,
    private el: ElementRef,
    private sanitizer: DomSanitizer
  ) { this.setupMarked(); }

  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('Text_chat') Text_chat!: ElementRef;

  // ฟังก์ชันนี้จะถูกเรียกเมื่อผู้ใช้พยายามปิดหน้าเว็บหรือรีเฟรช
  @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    this.saveChat()
  }

  @HostListener('window:resize', ['$event'])
  onResize = (event: any): void => {
    this.windowInnerWidth = window.innerWidth;
  };

  ngOnInit(): void {
    this.windowInnerWidth = window.innerWidth;
    this.select_newchat = true
    this.getHeader()
  };

  ngOnDestroy(): void {
    this.saveChat()
  }

  ngAfterViewInit(): void {
    let start_height = this.start_heightchat
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const divHeightInPx = entry.contentRect.height;
        const viewportHeight = window.innerHeight;
        this.height_text = (divHeightInPx / viewportHeight) * 100; // แปลงจาก px เป็น vh
        // console.log('Height in vh:', this.height_text);
        this.height_chat = start_height - this.height_text //ปรับความสูงเเชท
        // console.log('height_chat:', this.height_chat);
      }
    });

    resizeObserver.observe(this.Text_chat.nativeElement);
  }

  setupMarked() {
    const renderer: any = new marked.Renderer();

    renderer.code = (code: any, language: any | undefined) => {
      // console.log('Supported languages:', hljs.listLanguages());
      language = code.lang;
      // console.log("Language:", language);
      // console.log("Code:", code);

      // ตรวจสอบภาษาที่ใช้
      const validLang = !!(language && hljs.getLanguage(language));
      // console.log('Is valid language:', validLang);

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



  /////////////API/////////////////////

  getHeader() {
    this.service.getheader().subscribe(
      (res: any) => {
        // this.isOkLoading = false;

        this.headerdata = res.data
        // console.log("header>>>>", this.headerdata);
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
        this.header_chattext = res.data[0].content
        setTimeout(() => {
          this.handleScrollToBottom()
        }, 300);

        // console.log("history>>>>", this.historydata);
      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }

  selectHistory(uid: any) {
    // console.log('uid', uid);
    this.saveChat()
    this.uid_chat = uid
    console.log('uid_chat', this.uid_chat);
    this.select_newchat = false
    this.getHistory(uid)
    this.messages = []
    this.fix_scrollbug = 0
    this.historydata.forEach((element: any) => {
      if (element.uid == uid) {
        this.isChatuid[element.uid] = true
      } else {
        this.isChatuid[element.uid] = false
      }
    });

  }

  message(e: any) {
    // console.log('e', e);
    if (this.input_chat != '') {
      let data = this.input_chat
      // console.log('data', data);
      let chat_msg = {
        role: 'user',
        content: data
      }
      if (e.isTrusted && e.type == "click") {
        this.messages.push(chat_msg);  // เพิ่มข้อความไปยังรายการข้อความ
        this.input_chat = '';  // ล้างข้อความใน textarea
        this.getResponse_chat(data)
        this.fix_scrollbug = 0 // เเก้บัค scroll สั่น
        setTimeout(() => {
          this.handleScrollToBottom()
        }, 100);
        this.height_text = this.start_heightchat  // รีเซตความสูงเเชท
      }
      if (e.isTrusted && e.type == "keydown") {
        e.preventDefault(); // ป้องกันไม่ให้ขึ้นบรรทัดใหม่เมื่อกด Enter
        this.messages.push(chat_msg);  // เพิ่มข้อความไปยังรายการข้อความ
        this.input_chat = '';  // ล้างข้อความใน textarea
        this.getResponse_chat(data)
        this.fix_scrollbug = 0  // เเก้บัค scroll สั่น
        setTimeout(() => {
          this.handleScrollToBottom()
        }, 100);
        this.height_text = this.start_heightchat // รีเซตความสูงเเชท
      }
      this.input_chat = '';
    } else {
      e.preventDefault();
      this.input_chat = ''
    }
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
      stream: true,
      uid : this.uid_chat, 
    }
    this.isloading = true
    let chat_msg = {
      role: 'model',
      content: 'loading'
    }
    this.messages.push(chat_msg);
    this.service.getresponse_chat(body).subscribe(
      (res: any) => {
        // this.historydata = res.data
        // console.log("res_getResponse_chat>>>>", res);
        this.isloading = false
        chat_msg = {
          role: 'model',
          content: res.data
        }
        this.messages[this.messages.length - 1] = chat_msg
        this.checkmessage = true
        console.log('checkmessage',this.checkmessage);
        
        this.fix_scrollbug = 200
        setTimeout(() => {
          this.handleScrollToBottom()
        }, 1);
        // console.log('this.messages',this.messages);

      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }



  handleScrollChatBody(event: Event) {
    const chatBody = event.target as HTMLElement;
    const scrollTop = chatBody.scrollTop;
    const clientHeight = chatBody.clientHeight;
    const scrollHeight = chatBody.scrollHeight;
    // console.log('scrollTop', scrollTop);
    // console.log('clientHeight', clientHeight);
    // console.log('scrollHeight', scrollHeight);


    // ตรวจสอบว่ามีการเก็บค่า previous scrollTop หรือไม่
    const prevScrollTop = (chatBody as any)._prevScrollTop || 0;

    // ถ้าสิ้นสุดการเลื่อนแล้ว
    if (scrollTop + clientHeight > scrollHeight - 100) {
      this.isShowScrollToBottomBtn = false;
      this.shouldScrollChatBodyToBottom = true;
    }

    // ถ้ามีการเลื่อนขึ้น
    if (scrollHeight > clientHeight && prevScrollTop > 1 && prevScrollTop > scrollTop + 1) {
      this.shouldScrollChatBodyToBottom = false;
      this.isShowScrollToBottomBtn = true;
    }

    // เก็บค่า scrollTop ปัจจุบันใน property ขององค์ประกอบ DOM เอง
    (chatBody as any)._prevScrollTop = scrollTop;
  }

  handleScrollToBottom() {
    const chatBody = this.chatBody.nativeElement;

    // ตรวจสอบว่าไม่ได้อยู่ที่ตำแหน่งด้านล่างสุดแล้วค่อยเลื่อน
    if (chatBody.scrollTop + chatBody.clientHeight < chatBody.scrollHeight + this.fix_scrollbug) {
      chatBody.scroll({
        top: chatBody.scrollHeight,
        behavior: 'smooth' // เลื่อนแบบนุ่มนวล
      });
      this.isShowScrollToBottomBtn = false;
      this.shouldScrollChatBodyToBottom = true;
    }
  }

  saveChat() {
    if (this.checkmessage) {
      console.log('รีเฟรชหน้านี้');
      let body = {
        messages: "END",
        uid: this.uid_chat
      }
      this.service.save_chat(body).subscribe(
        (res: any) => {
          console.log("res_saveChat>>>>", res);
        },
        (err: any) => {
          console.log("getError>>>>", err);
        }
      );
    }
  }

  selectNewchat(){
    this.select_newchat = true
    this.header_chattext = 'New Chat'
    this.getHeader()
    this.saveChat()
    this.messages = []
    this.historydata = []
  }

}








