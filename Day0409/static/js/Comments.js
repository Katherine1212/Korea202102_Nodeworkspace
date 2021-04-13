// 게시물 한건을 표현하는 class정의. (한건을 생성 할 수 있는 틀)
class Comments{
    constructor(container,msg,author,writeDay){
        this.container=container; // 이 객체가 부착 될 부모 요소
        // 큰 틀
        this.wrapper;
        this.msgDiv;
        this.authorDiv;
        this.writeDayDiv;
        // 변수
        this.msg=msg;
        this.author=author;
        this.writeDay=writeDay;

        this.init()
    }
    init(){
        // 큰 틀
        this.wrapper= document.createElement("div");
        this.msgDiv= document.createElement("div");
        this.authorDiv= document.createElement("div");
        this.writeDayDiv= document.createElement("div");

        // wrapper에 css의 class 동적으로 적용
        this.wrapper.classList.add("comment-list");

        // 스타일
        this.msgDiv.style.width=65+"%";
        this.authorDiv.style.width=20+"%";
        this.writeDayDiv.style.width=10+"%";

        // innerHTML
        this.msgDiv.innerHTML=this.msg;
        this.authorDiv.innerHTML=this.author;
        this.writeDayDiv.innerHTML=this.writeDay;

        // div간 조립
        this.wrapper.appendChild(this.msgDiv);
        this.wrapper.appendChild(this.authorDiv);
        this.wrapper.appendChild(this.writeDayDiv);
        this.container.appendChild(this.wrapper);
    }
}