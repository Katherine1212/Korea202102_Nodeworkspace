// 코드가 같으면 예전에 사용한 코드를 재사용해보자
class Hero extends GameObject{
    constructor(container,src,width,height,x,y,velX,velY){
        // 부모인 GameObject 생성자를 호출하자.(매개변수 빠짐 없이)
        super(container,src,width,height,x,y,velX,velY);
        
        this.g=0.5; // 중력 가속도 효과를 내기 위한 변수. 이 변수는 부모 상속과는 별개
        this.jump=false; // 주인공의 점프 상태 판단
        /*
        히어로는 움직임이 있다. 따라서 메소드 정의가 요구됨.
        그렇지만, 부모에게 물려받은 메소드가 현제 나의 상황에는 맞지 않을 경우 업그레이드 할 필요 있다.
        (Java,C++등의 oop언어에서는 이러한 메소드 재정의 기법을 가리켜 오버라이딩(overring)이라고 한다.)
        */

    }
    tick(){
        /* 
        코드에서 보이진 않지만 현제 클래스는 GameObject의 모든 것을 가지고 있는 것과 마찬가지다.
        즉, 내 것 처럼 접근 가능 
        */
        this.velY=this.velY+this.g; // 중력 표현을 위해 가속도 처리.
        this.x=this.x+this.velX;
        this.y=this.y+this.velY;
  

        // 현재 화면에 존재하는 모든 벽돌들을 대상으로 주인공의 발바닥과 닿았는지 체크
        for(var i=0; i<blockArray.length; i++){
           var onBlock= collisionCheck(this.img,blockArray[i].img);
           /*
           onBlock이 참일때= 벽돌에 닿음
           1. 속도를 없애고
           2. 1번의 조건을 무조건 수행 하는 것이 아니라 원할 때만 수행 할 수 있도록 제어.
           */ 
           if(onBlock && this.jump==false){ // 주인공이 벽돌과 닿았다면&&주인공이 점프 상태가 아니라면
               this.velY=0; // 점프 버튼 누르면, vely값을 0으로 묶지 말기.
                // 위치를 벽돌 위에 고정(벽돌의 y값보다 자신의 키만큼 위로 올라가게)
                this.y=blockArray[i].y-this.height;
            }
            /* 
            주인공이 점프 한 후 다시 하강하는 순간을 포착하여 벽돌위에 서 있을 수 있는
            핵심 변수인 this.jump를 다시 false로 되돌려 놓자.
            */
           if(this.velY>0){ // 다시 하강하는 순간
               this.jump=false;
           }
        }
    }
    render(){
        this.img.style.left=this.x+"px";
        this.img.style.top=this.y+"px";
    }
}