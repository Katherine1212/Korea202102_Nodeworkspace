/*---------------- 쇼핑몰 개발 환경 구축 ----------------*/ 
var http= require("http");
// 외부
var express= require("express"); 
var static= require("serve-static"); 
var ejs= require("ejs"); 
var mysql= require("mysql");

var app= express();
app.use(static(__dirname+"/static")); // 정적자원 위치
app.use(express.urlencoded({ // post 요청의 파라미터 받기 위해
    extended:true
}));
// 템플릿 뷰엔진 등록(서버스크립트 위치 등록)
app.set("view engine","ejs"); // 등록 후 views라는 디렉토리 하위에서 ejs 찾음.
// library
var mymodule= require("./lib/mymodule.js");
// mysql 설정
const conStr={
    url:"localhost",
    user:"root",
    password:"1234",
    database:"shoppingmall"
}

/*---------------- 관리자 모드 ----------------*/
// 로그인 폼 요청
app.get("/admin/loginform",function(request,response){
    response.render("admin/login");
});
// 로그인 요청 처리
app.post("/admin/login",function(request,response){
    var master_id= request.body.master_id;
    var master_pass= request.body.master_pass;
    var sql= "select * from admin where master_id=? and master_pass=?";
    var con= mysql.createConnection(conStr);
    // mysql 접속
    con.query(sql,[master_id, master_pass], function(err,result,field){
        if(err){
            console.log("조회 실패",err);
        }else{
            // 로그인의 일치 유뮤
            if(result.length<1){
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                // 이전 화면으로 강제로 돌리기 history.back()
                response.end(mymodule.getMsgBack("로그인 정보가 올바르지 않습니다."));
            }else{
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgUrl("로그인 성공","/admin/main"));
            }
        }
        con.end(); // mysql 종료
    });
    
});
// 메인 요청 처리
app.get("/admin/main",function(request,response){
    response.render("admin/main");
});

// 상품관리 페이지 요청 처리
app.get("/admin/product/registform",function(request,response){
    var sql="select * from topcategory";
    var con= mysql.createConnection(conStr);
     // mysql 접속
    con.query(sql,function(err,result,fields){
        if(err){
            console.log("상위카테고리 조회 실패", err);
        }else{
            response.render("admin/product/regist",{
                record:result// 배열을 ejs에 전달
            });
        }
        con.end(); // mysql 종료
    });
});

// 선택한 상위 카테고리에 소속된 하위 카테고리 목록 가져오기
app.get("/admin/product/sublist",function(request,response){
    var topcategory_id= request.query.topcategory_id;
    var sql="select * from subcategory where topcategory_id="+topcategory_id;
    var con= mysql.createConnection(conStr);
    // mysql 접속
    con.query(sql, function(err,result, fields){
        if(err){
            console.log("하위 카테고리 목록 조회에 실패하였습니다.",err);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.render("admin/product/registform",{

            });
        }
        con.end(); // mysql 종료
    });
});


// 서버 가동
var server= http.createServer(app);
server.listen(9999,function(){
    console.log("Shoppingmall server is running at 9999 port");
});