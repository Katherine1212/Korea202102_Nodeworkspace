/*
Node.js의 기본 모듈로 서버 구축은 가능하나, 개발자가 처리 할 업무가 많고, 효율성이 떨어짐.
따라서 기본 모듈 외 http모듈을 개선한 express 모듈을 사용해보자.
주의) http기본 모듈이 사용되지 않은 것이 아니라 기본 모듈에 express모듈을 추가 하여 사용.

[express 모듈 특징]
1) 정적 자원에 대한 처리가 이미 지원.(개발자가 각 자원마다 1:1 대응 코드 작성 할 필요 없음)
    html,css,image,js(클라이언트측),txt 등등 서버에서 실행되지 않는 모든 리소스
2) get/post 등의 http 요청에 대한 파라미터 처리가 쉽다.
3) 미들웨어라고 불리우는 use() 메소드를 통해 기능 확장.
*/
var http= require("http"); // express는 http에 얹혀 쓰기 때문에 꼭 필요
var express= require("express"); 
var static= require("serve-static"); // 정적자원을 쉽게 접근하기 위한 미드웨어 추가
var app= express(); // express 모듈 통해 객체 생성
var fs= require("fs"); // file system 모듈
var ejs= require("ejs"); // 서버측 스크립트인 ejs관련 모듈(npm으로 다운)
var mysql=require("mysql");
var mymodule=require("./lib/mymodule.js");
const e = require("express");

// mysql 접속 정보
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
};

// 서버의 정적 자원에 접근을 위해 static() 미들웨어를 사용(static<->dynamic)
// app.use(static("쉽게 접근하고 싶은 정적자원의 경로;프로그래밍적으로 경로 지정"));
// __dirname 전역변수는? 현재 실행중인 js파일의 디렉토리 위치 반환. 즉 현재 실행중인 server.js의 디렉토리 반환
app.use(static(__dirname+"/static")); // static을 정적자원이 있는 루트로 지정
app.use(express.urlencoded({
    extended:true
})); // post 방식 처리 하기 위해
/*
클라이언트의 요청 처리(app.get()/app.post)
요청 url 에 대한 조건문과 정적자원 처리 필요 없음. 
*/ 
app.get("/notice/list",function(request,response){
    // 접속 시도
    var con= mysql.createConnection(conStr); // 시도 후 connection 객체 반환
    // select문 수행
    con.query("select * from notice order by notice_id desc",function(error,result,fields){
        if(error){
            console.log(error); // 에러분석
        }else{
            fs.readFile("./notice/list.ejs","utf8",function(err,data){
                /*
                읽기만 하는 것이 아니라 서버까지 실행 시켜야 하므로,
                render()메소드를 이용하여 %% 영역을 클라이언트에 보내기 전 서버측에서 먼저 실행.
                */
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(ejs.render(data,{
                    noticeList:result,
                    lib:mymodule
                }));
            });
        }
        con.end(); // sql 접속 종료
    });


});
// 지정한 url의 post방식으로 클라이언트 요정을 받음.
app.post("/notice/regist",function(request,response){
    // 1. 클라이언트가 전송한 파라미터를 받기. 
   var title=request.body.title;
   var writer=request.body.writer;
   var content=request.body.content;
   console.log(request.body);
   // 2. mysql 접속 후 connection지원
   var con= mysql.createConnection(conStr);
   /* 3. 쿼리 실행
   바인드 변수 이용하면 따옴표 문제를 고민하지 않아도 됨.
   ex)var sql="insert into notice(title, writer, content) values('"+title+"','"+writer+"','"+content+"',)";
   주의. 바인드 변수 사용목적은 따옴표때문이 아니라 DB의 성능과 관련 있다. */
   var sql="insert into notice(title, writer, content) values(?,?,?)";
   con.query(sql,[title,writer,content],function(err,fields){
    if(err){
        console.log(err);
    }else{
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end("<script>alert('등록완료');location.href='/notice/list';</script>");
    }
   });
   con.end(); // sql 접속 종료
});
// 목록 요청 처리
app.get("/notice/detail",function(request,response){
    // get방식으로 헤더를 통해 전송되온 파라미터를 확인
    var notice_id=request.query.notice_id;
    // 기존방식 var sql="select * from notice where notice_id="+notice_id;
    var sql="select * from notice where notice_id=?"; // 바인드 방식
    var con=mysql.createConnection(conStr); // 접속
    con.query(sql,[notice_id],function(err,result,field){
        console.log(result);
        if(err){
            console.log(err);
        }else{
            // 디자인 보여주기 전 조회수 증가.(목록 선택 후 증가하니까 else문)
            con.query("update notice set hit=hit+1 where notice_id=?",[notice_id],function(error,fields){
                if(error){
                    console.log(error);
                }else{
                    fs.readFile("./notice/detail.ejs","utf8",function(err0r,data){
                        if(err0r){
                            console.log(err0r);
                        }else{
                            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                            response.end(ejs.render(data,{
                                // result는 1건이여도 배열이기 때문에 꺼내서 보내기
                                record:result[0]
                            }));
                        }
                    });

                }
                con.end(); // sql 접속 종료
            });

        }
    });
});
// 수정 요청 처리
app.post("/notice/edit",function(request,response){
    // 파라미터 총 4개
    var title=request.body.title;
    var writer=request.body.writer;
    var content=request.body.content;
    var notice_id=request.body.notice_id;
    // 파라미터 받기
    var sql="update notice set title=?, writer=?, content=? where notice_id=?";
    var con=mysql.createConnection(conStr);
    con.query(sql,[title,writer,content,notice_id],function(err,fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("수정 완료.","/notice/detail?notice_id="+notice_id));
        }
        con.end();
    });
    
});
// express 모듈 통해 객체 생성
var server=http.createServer(app); // http서버에 express 모듈 적용
server.listen(8989,function(){
    console.log("The server using Express module is running at 8989");
});