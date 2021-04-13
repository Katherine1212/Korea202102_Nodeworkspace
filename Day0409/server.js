var http = require("http");
var express = require("express"); // 외부
var fs=require("fs");
var ejs =require("ejs"); // 외부
var static= require("serve-static"); // 정적자원 처리 모듈
var mymodule= require("./lib/mymodule.js");
// var bodyParser= require("body-parser");
var app = express();
app.use(static(__dirname+"/static"));// 미들웨어 등록(정적자원 루트 디렉토리로 등록)
app.use(express.urlencoded({extended:true})); // post 방식 데이터처리
// view엔진등록
// 뷰엔진 등록되면 확장자 명시 불필요.(view 디렉토리 참조할 것이며, 그 안에 모든 파일은 ejs니까)
app.set("view engine","ejs"); // 서버 스크립트 선택(예.ejs등등)

// oracle
var oracledb=require("oracledb"); // 외부
const conStr={ // const는 변수의 값을 고정시킨다.(상수화)
    user:"node",
    password:"node",
    connectString:"localhost/XE" // localhost:1521가 아니면 포트번호 필히 명시
}
// 커밋을 default
oracledb.autoCommit=true; // 쿼리문 실행 시마다 트랜젝션을 commit으로 처리
oracledb.fetchAsString=[oracledb.CLOB]; // clob을 string화


//게시판 목록 요청 처리 
app.get("/news/list", function(request, response){
    //클라이언트가 전송한 파라미터 받기!!!
    var currentPage = request.query.currentPage; //클라이언트가 보기를 원하는 페이지수
    
    //게시판의 최초 접속이라면, currentPage정보가 없기 때문에 1페이지로 간주함
    if(currentPage==undefined){ 
        currentPage=1;
    }
    console.log("currentPage ", currentPage);
    
    // 접속
    oracledb.getConnection(conStr,function(err,con){ // 접속 성공시 커넥션 객체 반환
        if(err){
            console.log("접속 실패",err);
        }else{
            console.log("접속 성공");
            // 쿼리문 실행
            var sql="select  n.news_id, title, writer, regdate, hit , count(msg) as cnt";
            sql+=" from news n  left outer join  comments c";
            sql+=" on n.news_id=c.news_id";
            sql+=" group by n.news_id, title, writer, regdate, hit";      
            sql+=" order by n.news_id desc";


            con.execute(sql,function(error1,result,fields){
                if(error1){
                    console.log("풰일이여",error1);
                }else{
                    console.log("결과여",result);
                    fs.readFile("./views/news/list.ejs", "utf8", function(error, data){
                        if(error){
                            console.log(error);
                        }else{
                            var r = ejs.render(data,{
                                //ejs에 넘겨줄 데이터 지정 
                                param:{
                                    page:currentPage,
                                    /* result 는 mysql과 다르게 json객체의 rows속성에
                                    2차원 배열에 들어가있다. */
                                    record:result.rows,
                                    lib:mymodule // ejs가 사용 가능하도록 lib명으로 모듈전달
                                }
                            }); //ejs 해석 및 실행하기!!
                            response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
                            response.end(r); //실행한 결과 전송하기!!
                        }
                    });   
                }
                con.close();
            });
        }
    });
    
});

// 등록
app.post("/news/regist", function(request,response){
    // 파라미터 받기
    var title= request.body.title;
    var writer= request.body.writer;
    var content= request.body.content;
    // 오라클 접속
    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log(err);
        }else{
            var sql= "insert into news(news_id, title, writer, content)";
            sql+= " values(seq_news.nextval, :1, :2, :3)";
            con.execute(sql,[title,writer,content],function(error,result){
                if(error){
                    console.log("등록중 에러 발생",error);
                }else{
                    // 여기서도 등록 된다는 보장 없음. 오라클에 반영여부는 result통해 봐야함.
                    console.log(result);
                    if(result.rowsAffected==0){ // 등록 실패
                        // status code는 http통신 시 서버의 상태를 말함.
                        response.writeHead(500,{"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록 실패","/news/list"));
                    }else{ // 등록 성공
                        // status code는 http통신 시 서버의 상태를 말함.
                        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                        response.end(mymodule.getMsgUrl("등록 성공","/news/list"));
                    }
                }
                con.close();
            });
        }
    });
});

// 상세보기
app.get("/news/detail",function(request,response){
    var news_id= request.query.news_id; // get방식으로 전송된 파라미터
    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log("접속 안도ㅑ",err);
        }else{
            var sql="select * from news where news_id="+news_id;
            con.execute(sql,function(error,result){
                if(error){
                    console.log("SQL문 실행 중 에러 발생",error);
                }else{
                    console.log("수행 결과 받아라",result);
                    // 댓글 목록 들고오기
                    sql="select * from comments where news_id= :1 order by comments_id asc"; // 오름차순
                    con.execute(sql,[news_id],function(error1,result1){
                        if(error1){
                            console.log("에러원인 받아라",error1);
                        }else{
                            // express 모듈이 response 객체의 기능을 업그레이드
                            // response.render()메소드는 기본적으로 views라는 디렉토리 안에 정해진 뷰엔진을 찾음.(뷰엔진은 개발자가 선택)
                            response.render("news/detail",{
                                news:result.rows[0], // 뉴스 목록
                                commentsList:result1.rows, // 코멘트 목록
                                lib:mymodule // 날짜 처리를 위한 모듈
                            });
                        }
                        
                        con.close();
                    });

                }
            });
        }
    });
});

// 코멘트 댓글 등록 요청 처리
app.post("/comments/regist",function(request,response){
    // 파라미터 받기
    var news_id= request.body.news_id;
    var msg= request.body.msg;
    var author= request.body.author;
    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log(err);
        }else{
            var sql= "insert into comments(comments_id, news_id, msg, author)";
            sql+= " values(seq_comments.nextval,:1, :2, :3)";
            con.execute(sql,[news_id,msg,author],function(error,result){
                if(error){
                    console.log("insert문 실행 줄 에러 발생",error);
                    /*
                      server's interma; fatal error
                      response.writeHead(500,{"Content-Type":"text/html;charset=utf-8"});
                      response.end(mymodule.getMsgUrl("이용에 불편을 드려 죄송합니다.","/news/list"));
                    */

                      response.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
                    /* 네트워크 상으로 주고받는 데이터는 문자열화 시켜서 주고 받음 그렇기 때문에 "{}" 사용 */
                    var str="";
                    str+="{";
                    str+= "\"result\":0";
                    str+= "}";
                    response.end(str); // end()메소드는 문자열을 인수로 받음
                }else{
                    /* 
                    response.redirect(); // 지정한 경로로 재접속
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(mymodule.getMsgUrl("댓글 등록.","/news/detail?news_id="+news_id));
                    클라이언트가 댓글등록 요청을 비동기 방식으로 요청 했기 때문에 클라이언트의 브라우저는 화면이 유지.
                    따라서, 서버는 클라이언트가 보게 될 디자인 코드를 보낼 이유가 없음.
                    Why? 보내는 순간 화면이 바뀌기 때문.
                    How? 디자인 일부에 사용 할 데이터만 전송하면 된다.
                    */
                    response.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
                    /* 네트워크 상으로 주고받는 데이터는 문자열화 시켜서 주고 받음 그렇기 때문에 "{}" 사용 */
                    var str="";
                    str+="{";
                    str+= "\"result\":1";
                    str+= "}";
                    response.end(str); // end()메소드는 문자열을 인수로 받음
                    
                }
                con.close();
            });

        }
    });
});
// select 문은 매개 변수가 3개

// 코멘트 목록가져오기
app.get("/comments/list",function(request,response){
    // oracle 연동
    oracledb.getConnection(conStr,function(err,con){
        if(err){
            console.log("oracle 연동 실패",err);
        }else{
            var news_id= request.query.news_id; // 해당뉴스 기사
            var sql= "select * from comments where news_id="+news_id;
            sql+= " oreder by comments_id desc";
            con.execute(sql,function(error,result,fields){
                if(error){
                    console.log("sql문 작동 중 실패",error);
                }else{
                    console.log("잘 반영됐다.",result);
                    response.writeHead(200,{"Content-Type":"text/json;charset=utf-8"});
                    response.end(JSON.stringify(result));
                }
                con.close();
            });
        }
    });
    
});

var server = http.createServer(app);
server.listen(8888, function(){
    console.log("The Server with Oracle is running at 8888 port...");
});