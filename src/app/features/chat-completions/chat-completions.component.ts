import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import hljs from 'highlight.js';
declare var Prism: any;
import { ApiService } from 'src/app/shared/services/api.service';

import 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';


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
  files_data: Array<any> = [] as Array<any>;
  total_flies = 0
  isselect_filesname: { [idx: number]: boolean } = {};
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
  windowInnerWidth: any
  checkmessage = false
  header_chattext = ''
  select_newchattext = false
  select_newchatimage = false
  select_newchatfiles = false
  select_historychat = false
  type_text = ''
  isOkLoading = false;
  selectFileToChat = false
  isdeleteFile = false
  nameTodelete = ''

  selectedimage: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  selectedfile: File | null = null;
  fileName: string | null = null;
  fileUrl: string | null = null;
  checknamefile = ''

  constructor(
    private service: ApiService,
    private el: ElementRef,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) { this.setupMarked(); }

  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('Text_chat') Text_chat!: ElementRef;

  // ฟังก์ชันนี้จะถูกเรียกเมื่อผู้ใช้พยายามปิดหน้าเว็บหรือรีเฟรช
  @HostListener('window:unload', ['$event'])
  unloadHandler(event: any) {
    // this.saveChat()
  }

  @HostListener('window:resize', ['$event'])
  onResize = (event: any): void => {
    this.windowInnerWidth = window.innerWidth;
  };

  ngOnInit(): void {
    this.windowInnerWidth = window.innerWidth;
    this.selectNewchatText()
  };

  ngOnDestroy(): void {
    // this.saveChat()
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

  getFiles() {
    this.service.getfiles().subscribe(
      (res: any) => {
        // this.isOkLoading = false;

        this.files_data = res.data
        this.total_flies = res.total_flies
        // console.log("header>>>>", this.headerdata);
      },
      (err: any) => {
        console.log("getError>>>>", err);
      }
    );
  }

  getHistory(uid: any) {
    this.service.gethistory(uid).subscribe(
      (res: any) => {
        this.historydata = res.data
        this.header_chattext = res.data[0].content ? res.data[0].content : res.data[1].content
        this.type_text = res.data[0].type
        this.isOkLoading = false;
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
    // this.saveChat()
    this.uid_chat = uid
    console.log('uid_chat', this.uid_chat);
    this.header_chattext = ''
    this.select_newchattext = false
    this.select_newchatimage = false
    this.select_newchatfiles = false
    this.select_historychat = true
    this.getHistory(uid)
    this.messages = []
    this.historydata = []
    this.fix_scrollbug = 0
    this.isOkLoading = true;
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
        content: data,
        type: 'text'
      }

      let dataimage = this.imageUrl
      // console.log('data', data);
      let chat_image = {
        role: 'user',
        content: dataimage,
        type: 'image'
      }

      if (e.isTrusted && e.type == "click") {
        this.messages.push(chat_image);
        this.messages.push(chat_msg);  // เพิ่มข้อความไปยังรายการข้อความ
        this.input_chat = '';  // ล้างข้อความใน textarea
        this.imageUrl = null
        if (this.selectFileToChat) {
          this.onUploadfile(data)
        }
        if (this.select_newchatimage) {
          this.onUpload(data)
        }
        if (this.select_newchattext || this.select_historychat) {
          this.getResponse_chat(data)
        }
        this.fix_scrollbug = 0 // เเก้บัค scroll สั่น
        setTimeout(() => {
          this.handleScrollToBottom()
        }, 100);
        this.height_text = this.start_heightchat  // รีเซตความสูงเเชท
      }
      if (e.isTrusted && e.type == "keydown") {
        e.preventDefault(); // ป้องกันไม่ให้ขึ้นบรรทัดใหม่เมื่อกด Enter
        this.messages.push(chat_image);
        this.messages.push(chat_msg);  // เพิ่มข้อความไปยังรายการข้อความ
        this.input_chat = '';  // ล้างข้อความใน textarea
        this.imageUrl = null
        if (this.selectFileToChat) {
          this.onUploadfile(data)
        }
        if (this.select_newchatimage) {
          this.onUpload(data)
        }
        if (this.select_newchattext || this.select_historychat) {
          this.getResponse_chat(data)
        }
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
      uid: this.uid_chat,
      type: 'textonly',
      type_chat: 'text'
    }
    this.isloading = true
    let chat_msg = {
      role: 'model',
      content: 'loading',
      type: 'text'
    }
    this.messages.push(chat_msg);
    this.service.getresponse_chat(body).subscribe(
      (res: any) => {
        // this.historydata = res.data
        // console.log("res_getResponse_chat>>>>", res);
        this.isloading = false
        chat_msg = {
          role: 'model',
          content: res.data,
          type: 'text'
        }
        this.messages[this.messages.length - 1] = chat_msg
        this.checkmessage = true
        console.log('checkmessage', this.checkmessage);

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

  // saveChat() {
  //   if (this.checkmessage) {
  //     console.log('รีเฟรชหน้านี้');
  //     let body = {
  //       messages: "END",
  //       uid: this.uid_chat
  //     }
  //     this.service.save_chat(body).subscribe(
  //       (res: any) => {
  //         console.log("res_saveChat>>>>", res);
  //       },
  //       (err: any) => {
  //         console.log("getError>>>>", err);
  //       }
  //     );
  //   }
  // }

  selectNewchatText() {
    this.select_newchattext = true
    this.select_newchatimage = false
    this.select_newchatfiles = false
    this.select_historychat = false
    this.header_chattext = 'New Chat'
    this.type_text = ''
    this.uid_chat = JSON.stringify(new Date().getTime())
    console.log('this.uid_chat', this.uid_chat);
    this.getHeader()
    // this.saveChat()
    this.messages = []
    this.historydata = []
  }

  selectNewchatImage() {
    this.select_newchatimage = true
    this.select_newchattext = false
    this.select_newchatfiles = false
    this.select_historychat = false
    this.header_chattext = 'New Chat'
    this.uid_chat = JSON.stringify(new Date().getTime())
    console.log('this.uid_chat', this.uid_chat);
    this.type_text = ''
    this.getHeader()
    // this.saveChat()
    this.messages = []
    this.historydata = []
  }

  selectNewchatFiles(checked: boolean) {
    if (checked) {
      this.select_newchatimage = false
      this.select_newchattext = true
      this.select_newchatfiles = true
      this.select_historychat = false
      this.header_chattext = 'New Chat'
      this.selectFileToChat = false
      this.getFiles()
    } else {
      this.select_newchatimage = false
      this.select_newchattext = true
      this.select_newchatfiles = false
      this.select_historychat = false
      this.header_chattext = 'New Chat'
      this.selectFileToChat = false
      this.files_data.forEach((element: any, i: any) => {
        this.isselect_filesname[i] = false
      })
    }

    this.uid_chat = JSON.stringify(new Date().getTime())
    console.log('this.uid_chat', this.uid_chat);
    this.type_text = ''
    this.getHeader()
    // this.saveChat()
    this.messages = []
    this.historydata = []
  }

  selectFiles_name(file_name: string, idx: any) {
    this.selectFileToChat = true
    this.select_newchattext = false
    console.log('file_name', file_name);
    this.files_data.forEach((element: any, i: any) => {
      if (i == idx) {
        this.isselect_filesname[i] = true
        this.header_chattext = file_name
        this.checknamefile = file_name
      } else {
        this.isselect_filesname[i] = false
      }

    })

  }

  selectEdit_file(event: Event,name:any) {
    event.stopPropagation();
    this.nameTodelete = name
  }

  // ฟังก์ชันสำหรับจัดการการเลือกไฟล์
  onImageSelected(event: any) {
    const file = event.target.files[0];
    this.selectedimage = file;

    // สร้างตัวอ่านไฟล์ (FileReader) เพื่อแสดงรูปภาพที่เลือก
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result;

    };
    reader.readAsDataURL(file);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.selectedfile = file;
    this.checknamefile = file.name
    if (file) {
      this.fileName = file.name;  // เก็บชื่อไฟล์
      console.log('file.name', file.name);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      console.log('fileExtension', fileExtension);
      if (fileExtension === 'txt' || fileExtension === 'pdf') {
        const reader = new FileReader();

        // แปลงไฟล์เป็น Data URL เพื่อนำไปใช้แสดงในหน้า HTML
        reader.onload = (e: any) => {
          this.fileUrl = e.target.result;
        };
        this.onUploadfile('')
        reader.readAsDataURL(file);  // อ่านไฟล์เป็น Data URL
      } else {
        this.fileUrl = null; // ถ้าไม่ใช่ PDF จะไม่แสดงตัวอย่าง
        alert('Please upload a valid PDF file.');
      }
    }
  }

  // ฟังก์ชันสำหรับอัปโหลดไฟล์
  onUpload(data: any) {
    let chat_msg = {
      role: 'model',
      content: 'loading',
      type: 'text'
    }
    this.messages.push(chat_msg);
    this.isloading = true
    let typechat = ''
    const formData = new FormData();
    if (this.selectedimage) {
      formData.append('photo', this.selectedimage, this.selectedimage.name);
      formData.append('type', 'imageandtext');
    } else {
      formData.append('type', 'textonly');
    }
    formData.append('text', data);
    formData.append('uid', this.uid_chat);
    formData.append('type_chat', 'image');

    this.service.image_text(formData).subscribe(
      (res: any) => {
        console.log("image_text>>>>", res);
        this.isloading = false
        let chat_msg = {
          role: 'model',
          content: res.data,
          type: 'text'
        }
        this.messages[this.messages.length - 1] = chat_msg
        this.checkmessage = true
        console.log('checkmessage', this.checkmessage);
        this.selectedimage = null
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

  // ฟังก์ชันสำหรับอัปโหลดไฟล์
  onUploadfile(data: any) {
    if (data) {
      let chat_msg = {
        role: 'model',
        content: 'loading',
        type: 'text'
      }
      this.messages.push(chat_msg);
      this.isloading = true
      let typechat = ''
      const formData = new FormData();
      if (this.selectedfile) {
        formData.append('file', this.selectedfile, this.selectedfile.name);
        formData.append('type', 'fileandtext');
      } else {
        formData.append('type', 'textonly');
      }
      formData.append('text', data);
      formData.append('uid', this.uid_chat);
      formData.append('type_chat', 'file');
      formData.append('file_name', this.checknamefile);

      this.service.upload_file(formData).subscribe(
        (res: any) => {
          console.log("upload_file>>>>", res);
          this.header_chattext = res.file_name
          this.isloading = false
          let chat_msg = {
            role: 'model',
            content: res.data,
            type: 'text'
          }
          this.messages[this.messages.length - 1] = chat_msg
          this.checkmessage = true
          console.log('checkmessage', this.checkmessage);
          this.selectedfile = null
          this.fix_scrollbug = 200
          setTimeout(() => {
            this.handleScrollToBottom()
          }, 1);
          // console.log('this.messages',this.messages);
        },
        (err: any) => {
          console.log("upload_fileError>>>>", err);
          this.selectedfile = null
        }
      );
    } else {
      // this.isloading = true
      const formData = new FormData();
      if (this.selectedfile) {
        formData.append('file', this.selectedfile, this.selectedfile.name);
        formData.append('type', 'fileandtext');
      } else {
        formData.append('type', 'textonly');
      }
      formData.append('text', data);
      formData.append('uid', this.uid_chat);
      formData.append('type_chat', 'file');
      formData.append('file_name', this.checknamefile);

      this.service.upload_file(formData).subscribe(
        (res: any) => {
          console.log("upload_file>>>>", res);
          // this.isloading = false
          // let chat_msg = {
          //   role: 'model',
          //   content: res.data,
          //   type: 'text'
          // }
          // this.messages[this.messages.length - 1] = chat_msg
          // this.checkmessage = true
          // console.log('checkmessage', this.checkmessage);
          this.selectedfile = null
          this.getFiles()
          // this.fix_scrollbug = 200
          // setTimeout(() => {
          //   this.handleScrollToBottom()
          // }, 1);
          // console.log('this.messages',this.messages);
        },
        (err: any) => {
          console.log("upload_fileError>>>>", err);
        }
      );
    }

  }

  deleteFile_Open(): void {
    this.isdeleteFile = true;
  }

  deleteFile_Confirm(): void {
    console.log('Button ok clicked!');
    let name = this.nameTodelete
      this.service.deleteFile(name).subscribe(
        (res: any) => {
          // this.isOkLoading = false;
          this.isdeleteFile = false;
          this.getFiles()
        },
        (err: any) => {
          console.log("deleteFileError>>>>", err);
        }
      );
  }

  deleteFile_Cancel(): void {
    console.log('Button cancel clicked!');
    this.isdeleteFile = false;
  }

}








