var http= require("http"); // 내장 모듈
var fs= require("fs"); // 파일 시스템 모듈

// 직렬화된(분해된) 전송한 데이터에 대한 해석 담당.(문자열로 해석 가능)
var qs=require("querystring"); 
var url=require("url"); // url 분석과 관련된 내부 모듈

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
    /*
    혹여나, 파라미터가 get방식으로 전송되어 올 경우엔
    reuqest.url의 파라미터까지도 주소로 간주 될 수 있기 때문에 파라미터 제거
    */
    // console.log("url분석 및 파싱 한 결과는", url.parse(request.url)); 
    var requestUrl=url.parse(request.url).pathname; // 파라미터를 제외한 주소
    switch(requestUrl){
        case"/member/form":regiForm(request, response);break;
        case"/member/join":regist(request, response);break;
        case"/member/list":getList(request, response);break;
        case"/member/detail":getDetail(request, response);break;
        case"/member/edit":getEdit(request, response);break;
        case"/member/delete":getDelet(request, response);break;

        // 이미지 처리
        case "/photo/img1": getImage(request, response);break;
    }
});
/*
이미지, css, js, html, 기타 서버에서 실행되지 않는 자원들을 가리켜 정적자원(static)
1:1로 대응되는 요청을 처리한다면 개발 효율성이 떨어짐. 
결론은 정적자원처리 뿐만아니라 개발의 편의성을 위해 좀 더 개선된 서버 모듈로 전환할 필요가 있다.*/
function getImage(request, response){
    fs.readFile("./images/Among Us/Die white.png",function(err,data){
        response.writeHead(200,{"Content-Type":"image/png"});
        response.end(data);
    });
}
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

function getList(request,response){
    var con= mysql.createConnection(conStr); // mysql 접속
    var sql="select * from member"; // sql에 select문 날리기
    con.query(sql,function(error,record,fields){ // 형식: sql문,결과레코드, 필드 정보
        // record에는 json들이 일차원 배열로 탑재.
       // console.log("record is",record);

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
    // 한 사람에 대한 정보를 가져오기.(Mysql먼저 접속)
    var con= mysql.createConnection(conStr); // 접속
    /* 
    아래 쿼리문에서 사용되는 pk값은 클라이언트가 전송한 값으로 대체

    get 방식은 body를 통해 넘겨지는 post 방식에 비해 header를 타고 전송되어오므로 추출하기에 용이.
    (마치 봉투의 겉면에 쓰여진 글씨와 동일)
    */
    
    /*
    개발자가 직접 url을 문자열 분석 시도하기 보다는 url을 전문적으로 해석 및 분석 할 수 있는 모듈에게 맡김.
    그 역할을 수행하는 모듈이 url 내부모듈이다.
    querystring: pst 방식의 파라미터 추출
    url: get 방식의 파라미터 추출

    url.parse()-> 쓸 수는 있으나 지원 안 함
    */ 
    var param=url.parse(request.url,true).query; // true를 매개변수로 넘기면 json형태로 파라미터를 반환
    console.log("상세보기에 필요한 추출파라미터는 ",param);
    var member_id=param.member_id; // json으로 추출
    var sql="select * from member where member_id="+member_id; // MySQL에서 1명의 정보만 뽑는 식
  
    con.query(sql,function(err,result,fields){ // 쿼리문 수행
        console.log(result);
        // 쿼리문 수행 완료 시점. 이때 사용자에게 상세페이지 보여줌.
        fs.readFile("./detail.ejs","utf8",function(err,data){
            if(err){
                console.log(err);
            }else{
                // 클라이언트에게 html을 읽어들인 내용을 보여주기
                response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
                
                /* render의 대상은 ejs 파일 내 %%영역만. 
                모든 render작업이 끝나면 html로 재구성하여 응답정보에 실어서 클라이언트에게 응답을 호출. 
                */
                response.end(ejs.render(data,{
                    record:result[0]
                }));
            }
        });
    });
    con.end(); // 접속 해제
}
function getEdit(request, response){
    // 쿼리문에 사용 될 4개의 파라미터값을 받아서 변수에 담기. 글 수정은 post방식(바디에 담김)->querystring();
    // post방식은 버퍼에 담겨오기 때문에 분산된(직렬화된) 데이터를 문자열로 모아 처리.
    var content="";
    request.on("data",function(data){ // post data날라오는 것을 감지
        content+=data;
    });  
    request.on("end",function(){ // 파라미터가 하나의 문자열로 복원
        var obj= qs.parse(content);
        console.log("파싱한 결과",obj);
        var sql="update member set user_id='"+obj.user_id+"',user_pass='";
        sql+= obj.user_pass+"',user_name='"+obj.user_name+"'";
        sql+="where member_id="+obj.member_id;
        /*
        DML(insert,update,delet): 매개변수 2개(error,fields)
        select문: 매개변수 3개(error,result,fields)
        */
       var con= mysql.createConnection(conStr);
        con.query(sql,function(err,fields){
            if(err){
                console.log(err);
            }else{
                response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
                response.end("<script>alert('수정되었습니다');location.href='/member/detail?member_id="+obj.member_id+"';</script>");

            }
            con.end(); // 접속 해체
       });
    });

}
function getDelet(request, response){
    // querystring(post방식), url(get방식)
    var param= url.parse(request.url,true).query;
    console.log("클라이언트가 전송한 파라미터는 ",param);
    var sql="delete from member where member_id="+param.member_id;
    // 쿼리문 구성 완료. mysql에 접속해 해당 쿼리 실행
    /*접속 및 connection 객체 반환
    connection 객체란? 접속 정보를 가진 객체. 쿼리 수행 및 mysql 접속 해제 가능*/ 
    var con= mysql.createConnection(conStr); 
    /* select문의 경우에 결과를 가져와야 하기 때문에 error,result, fields로 쓰지만,
    delet, update, insert DML은 가져올 레코드가 없기 때문에 인수가 2개여도 충분 */
    con.query(sql,function(err,fields){
        if(err){
            console.log(err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
            response.end("<script>alert('삭제완료');location.href='/member/list';</script>");
        }
        con.end(); // 접속 해제
    });

}

   
// 데이터베이스에 회원정보 넣는 요청처리

server.listen(9055,function(){
    console.log("server is running at 9055 port");
});