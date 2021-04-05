// 서버 구축하기
var http= require("http"); // http 모듈 가져오기
var fs=require("fs"); // 파일 다룰 때 사용 되는 모듈
var mysql=require("mysql"); //MySQL 연동하기 위한 모듈
/* MySQL은 외부 모듈이기때문에 개발 시 추가 설치 필요하다.
추가 설치 명령어: cmd->npm install mysql
npm(Node.js Package Manager) 이라는 툴 이용 시, 
Node.js 개발 시 모듈 설치와 관련된 많은 기능을 지원함 */


var server= http.createServer(function(request,response){
    /* 
    클라이언트에 응답하기
    클라이언트에게 보여줄 html문서를 이루고 있는 코드를 읽어들여서 응답정보로 내기
    */ 
    /*
    클라이언트가 브라우저의 URL에 어떤 주소를 입력했는지를 조사해보자.
    그 조사 결과에 따라서 아래 코드 중 어떤 코드가 실해오딜지를 결정 짓자.
    Request 객체란? 클라이언트의 요청 정보를 가진 객체이기때문에
    클라이언트가 입력한 url정보도 이 객체를 통해 얻을 수 있다.
    */
   var url=request.url;
   console.log("클라이언트가 요청 시 입력한 주소는",url);
    /* 
    localhost:8888/member/form ---- 회원가입 디자인 폼 요청으로 간주
    localhost:8888/member/regist ---- 회원가입 요청으로 간주
    localhost:8888/member/result ---- 회원가입 완료로 간주
   */
   if(url=="/member/form"){
       
      // 회원가입을 희망하는 사람이라면
      fs.readFile("./regi_form.html","utf8", function(error,data){
          // 파일의 내용을 모두 읽어들인 순간 data라는 익명함수가 동작. 물론 읽다가 오류가 생기면 error
          response.end(data);
      });
      
    }else if(url=="/member/regist"){
        // 회원가입 등록 희망시
        // 쿼리문 수행 전에 Node.js가 MySQL에 접속을 성공해야함.
        // MySQL 접속
        var con= mysql.createConnection({  //--- 접속
            url:"localhost:3306", //--- 정해진 값(DB는 네트워크 프로그램이라 포트 필요)
            database:"nodejs",    //--- 사용중인 DB명
            user:"root",
            password:"1234"
        }); 
        console.log("접속 결과 객체",con);

        var sql="insert into member(user_id, user_pass, user_name)";
        sql+= " values('Superman','7777','슈퍼맨')";
        // 쿼리문 수행
        con.query(sql,function(err,fields){ 
            if(err){
                console.log("쿼리문 수행 중 에러 발생!",err);
            }else{
                console.log("등록 성공.");
            }
        }); 

    }else if(url=="/member/result"){
        // 회원가입 성공한 사람이라면
        fs.readFile("./result.html","utf8", function(error,data){
            // 파일의 내용을 모두 읽어들인 순간 data라는 익명함수가 동작. 물론 읽다가 오류가 생기면 error
            response.end(data);
        });
    }

}); // 서버 객체 생성

// 서버 가동
server.listen(8888,function(){
    console.log("Server is running at 8888");
})