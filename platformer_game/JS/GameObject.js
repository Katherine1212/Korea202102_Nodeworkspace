/*
객체 지향에서는 현실에서의 상속 개념을 코드로 구현이 가능.
즉, 모든 자식이 보유할 공통 고드를 자식 객체마다 코드를 중복시키지 않고 
부모 객체에 공통코드를 작성 할 수 있다.
이런 코드 기법을 지원하는 이유는? 코드의 재사용. 유지보수성이 높아진다. 시간이 세이브된다. 돈 벌린다.
*/

// 게임에 등장 할 모든 객체의 최상위 객체
class GameObject{
    constructor(container,src,width,height,x,y,velX,velY){
        this.container=container;
        this.img=document.createElement("img");
        this.src=src;
        this.width=width;
        this.height=height;
        this.x=x;
        this.y=y;
        this.velX=velX;
        this.velY=velY;

        this.init();
    }
    init(){
        this.img.src=this.src;  // 넘겨받은 경로로 이미지 생성
        // 크긴
        this.img.style.width=this.width+"px";
        this.img.style.height=this.height+"px";
        // 위치
        this.img.style.position="absolute";
        this.img.style.left=this.x+"px";
        this.img.style.top=this.y+"px";

        this.container.appendChild(this.img);//부착

    }
    tick(){
        /* 
        누구를 염두하고 코드를 넣어두어야 하나?
        자식이 누구일지 그리고 어떠한 움직임을 가질지 알 수 없으므로 
        코드를 작설할 수 없거니와 작성해서도 안 된다. 
        이렇게 부모 클래스가 내용없이(몸체없이) 작성한 메서드를 가리켜 추상메소드라고 함.
        추상 메소드의 본 목적은 자신이 불완전하게 남겨놓은 기능을 자식에게 구현할 것을 강제하기 위함.
        */
    }
}