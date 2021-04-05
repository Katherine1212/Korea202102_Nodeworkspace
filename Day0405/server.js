var http= require("http"); // 내장 모듈
var fs= require("fs"); // 파일 시스템 모듈
// 직렬화된(분해된) 전송한 데이터에 대한 해석 담당.(문자열로 해석 가능)
var qs=require("querystring"); 
var mysql= require("mysql"); // mysql 외부모듈 가져오기
var ejs= require("ejs"); // ejs 외부 모듈 가져오기
// DB 접속 정보
var conStr={
    url:"localhost:3306",
    database:"nodejs",
    user:"root",
    password:"1234"
}

var server= http.createServer(function(request, response){
    /*
    서버는 클라이언트의 다양한 요청을 처리 하기 위해 요청을 구분. 
    결국 클라이언트가 무엇을 원하는지에 대한 정보는 요청 URl로 구분.
    따라서 요청과 관련된 정보를 가진 객체인 request 객체 이용
    */ 
   console.log("클라이언트가 지금 요청한 주소는",request.url);
   // 도메인: 포트번호까지를 루트로 부르기
   /*
   회원가입 폼 요청: /member/form
   회원가입 요청: /member/join
   회원 목록(검색은 목록에 조건 부여) 요청: /member/list
   회원 상세보기 요청: /member/detail
   회원 정보 수정 요청: /member/edit
   회원 정보 삭제 요청: /member/delete
   */
    switch(request.url){
        case"/member/form":regiForm(request, response);break;
        case"/member/join":regist(request, response);break;
        case"/member/list":getList2(request, response);break;
        case"/member/detail":getDetail(request, response);break;
        case"/member/edit":getEdit(request, response);break;
        case"/member/delete":getDelet(request, response);break;
    }
});
function regiForm(request, response){
    /* 
    입력 폼 요청 시 응답 정보
    [파일 읽기] 
    */
    fs.readFile("./regi_form.html","utf8",function(err,data){
        // 파일을 다 읽어 들이면 응답 정보 구성하여 클라이언트에게 전송
        response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}); // 헤더에 담을 것
        response.end(data); // 몸체에 담을 것
    });
}
function regist(request, response){
    /* 
    클라이언트가 post 방식으로 전송했기 때문에 http 데이터 구성 중 body를 통해 전송.
    post 방식의 파라미터를 끄집어내보자.
    on이란 request 객체가 보유한 데이터 감지 메소드(데이터가 들어왔을 때 를 감지)
    */
    var content= "";
    request.on("data",function(param){
        /*
        parma에는 body안에 들어있는 데이터가 서버의 메모리 버퍼로 들어오고,
        그 데이터를 param이 담고 있다.
        */
       content+= param; // 버퍼의 데이터 모으기
    });
    // 데이터가 모두 전송되어 받아지면 end 호출
    request.on("end",function(){
        console.log("전송 받은 데이터는", content);

        // 파싱 한 결과는 객체지향 개발자들이 쉽게 해석 가능한 Json으로 반환
        console.log("파싱한 결과는",qs.parse(content));
        var obj=qs.parse(content); 

        /* 실행 시점
        데이터베이스에 쿼리문을 전송하기 위해서는 먼저 접속이 선행
        접속 시도하는 메서드 반환 값. 
        접속 정보로는 객체가 반환되며, 이 객체로 쿼리실행 */
        var con= mysql.createConnection(conStr);
        // 쿼리문 실행하는 메소드 명: query();
        var sql="insert into member(user_id,user_pass,user_name)";
        sql+=" values('"+obj.user_id+"','"+obj.user_pass+"','"+obj.user_name+"')";
        con.query(sql,function(error,fields){ // 쿼리문 실행 시점
            if(error){ // 쿼리 수행 중 에러
                response.writeHead(500,{"Content-Type":"text/html; charset=utf-8"})
                response.end("서버 오류 발생");
            }else{
                response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"})
                response.end("회원 등록 처리<br> <a href='/member/list'>회원목록 바로 가기</a>");
    
            }
            // db 성공여부와 상관없이 연결된 접속은 끊기.
            con.end();
        }); 
    });


}
/*
회원 목록 가져오기

해당 방법은 디자인 마저도 프로그램 코드에서 감당하기 때문에 유지보수성이 낮음.
따라서 프로그램코드와 디자인은 분리 되어야 한다.

function getList(request, response){
    // 연결 된 db 커넥션이 없으므로 mysql에 재접속
    var con= mysql.createConnection(conStr);
    var sql="select * from member"; // sql에 select문 날리기
    /* 
    2번째 인수: select 문 수행 결과 배열
    3번째 인수: 컬럼에 대한 메타 정보
    (메타 데이터란? 정보 자체에 대한 정보 여기서는 컬럼의 자료형, 크기등에 대한 정보)
    
    con.query(sql,function(error,result,fields){
        
        console.log("쿼리문 수행 수 받아온 데이터는 ",result);
        console.log("결과 레코드 수는? ",result.length); // result 분석
        console.log("컬럼 정보 ",fields); 

        var tag="<table width='100%' border='1px'>";

        for(var i=0; i<result.length; i++){
            // 표만들기
            var mem= result[i]; // 한 사람에 대한 정보
            var member_id=mem.member_id; // 번호
            var user_id=mem.user_id; // 아이디
            var user_pass=mem.user_pass; // 비밀번호
            var user_name=mem.user_name; // 이름
            var regdate=mem.regdate; // 등록일

            tag+="<tr>";
            tag+="<td>"+member_id+"</td>";
            tag+="<td>"+user_id+"</td>";
            tag+="<td>"+user_pass+"</td>";
            tag+="<td>"+user_name+"</td>";
            tag+="<td>"+regdate+"</td>";
            tag+="</tr>";
            
        }
        tag+= "<tr>";
        tag+= "<td colspan='5'><a href='/member/form'>회원등록</a></td>";
        tag+= "</tr>";

        tag+="</table>";

        response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
        response.end(tag);

        // DB 닫기
        con.end();
    });
}
*/



function getList2(request,response){
    var con= mysql.createConnection(conStr); // mysql 접속
    var sql="select * from member"; // sql에 select문 날리기
    con.query(sql,function(error,record,fields){ // 형식: sql문,결과레코드, 필드 정보
        // record에는 json들이 일차원 배열로 탑재.
        console.log("record is",record);

        // 클라이언트에게 결과를 보여주기 전, 미리 DB여동하여 레코드를 가져와야함.
        fs.readFile("./list.ejs","utf8",function(error,data){
            if(error){
                console.log("로드 실패");
            }else{
                response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"})
                /*
                클라이언트에게 list.ejs를 그냥 보내지말고 서버에서 실행시킨 후
                그 결과를 클라이언트에게 전송한다.
                즉, ejs를 서버에서 랜더링을 시켜야 한다.
                */
               var result= ejs.render(data,{
                   members: record
               });
                response.end(result);
            }
        });
    });

}

function getDetail(request, response){
    
}
function getEdit(request, response){
    
}
function getDelet(request, response){
    
}

   
// 데이터베이스에 회원정보 넣는 요청처리

server.listen(9055,function(){
    console.log("server is running at 9055 port");
});