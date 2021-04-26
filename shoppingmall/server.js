/*------------------------ 쇼핑몰 개발 환경 구축 ------------------------*/ 
var http= require("http");
// 외부
var express= require("express"); // 서버측 세션 처리하는 모듈
var expressSession= require("express-session"); 
var static= require("serve-static"); // 정적파일
var ejs= require("ejs"); // ejs파일 처리
var mysql= require("mysql");
var path= require("path");
var multer= require("multer"); // 업로드 처리 모듈
/*
멀터 모듈이 기존의 순수한 request 객체를 분석해서 파일, 파라미터등을 처리.
클라이언트가 파일을 전송하기 위한 인코딩 타입인 multipart/form-data 를 명시하는 순간부터는
순수한 request로는 파일 처리 및 파라미터를 받을 수 없으며 업로드 모듈을 통해 업무 처리 해야함.
jsp,php,asp등 언어도 원리가 동일
*/

var app= express();
app.use(static(__dirname+"/static")); // 정적자원 위치
app.use(express.urlencoded({ // post 요청의 파라미터 받기 위해
    extended:true
}));
// 세션 설정
app.use(expressSession({
    secret:"key secret",
    resave:true,
    saveUninitialized:true
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
// 기존의 순수 요청 정보 request 객체를 multer에게 전달.(multer가 분석하기 위해)
var upload= multer({
    storage: multer.diskStorage({
        destination:function(request, file, cb){
             cb(null,__dirname+"/static/product");
        },
        filename:function(request, file, cb){
            cb(null,new Date().valueOf()+path.extname(file.originalname));
        }
    })
});

/*------------------------ 관리자 모드 ------------------------*/

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
                /*DB 조회가 성공했으므로, 해당 관리자 정보를 session영역에 담기
                추후 클라이언트가 재요청 들어오더라도 이미 서버측 메모리에 존재한는
                세션을 참고하여 재인증 하지 않아도 됨. 
                마치, 웹이 네트워크를 유지하는 것 처럼.(원래 웹은 네트워크연결 유지가 불가능)
                */
                request.session.admin={
                    admin_id:result[0].admin_id,
                    master_id:result[0].master_id,
                    master_pass:result[0].master_pass,
                    master_name:result[0].master_name
                }
                response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                response.end(mymodule.getMsgUrl("로그인 성공","/admin/main"));
            }
        }
        con.end(); // mysql 종료
    });
    
});
// 메인 요청 처리
app.get("/admin/main",function(request,response){
    /*
    인증받은 관리자의 정보를 DB가 아닌 메모리 영역 세션을 통해 가져오기
    인증 과정을 수행했는지 여부는 
    request.session.변수 객체에 개발자가 의도한 변수가 존재하는지 여부로 판단
    */
    checkAdminSession(request,"admin/main",response);
});

// 상품관리 페이지 요청 처리
app.get("/admin/product/registform",function(request,response){
    // 로그인 하지 않고 접속했다면
    if(request.session.admin==undefined){
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(mymodule.getMsgBack("관리자 인증이 필요한 페이지입니다."));
    }else{

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
    }
});

// 선택한 상위 카테고리에 소속된 하위 카테고리 목록 가져오기
// 비동기로 요청(그래야 상위 카테고리 선택 시 하위 카테고리 가져올 수 있음)
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
            response.end(JSON.stringify(result));
        }
        con.end(); // mysql 종료
    });
});
// 상품등록
app.post("/admin/product/regist",upload.single("product_img"),function(request,response){
    // 파라미터 받기
    var subcategory_id= request.body.subcategory_id;
    var product_name= request.body.product_name;
    var price= request.body.price;
    var brand= request.body.brand;
    var detail= request.body.detail;
    var filename= request.file.filename;
    var sql="insert into product(subcategory_id, product_name, price,brand, detail, filename)";
    sql+=" values(?,?,?,?,?,?)"
    var con= mysql.createConnection(conStr);
    con.query(sql,[subcategory_id, product_name, price, brand, detail, filename],function(err,fields){
        if(err){
            console.log("상품 등록 중 실패하였습니다.",err);
        }else{
            response.redirect("/admin/product/list"); // 클라이언트로 하여금 지정한 url로 재접속 유도
        }
        con.end();
    });
});
// 목록
app.get("/admin/product/list",function(request,response){
    // 기본적인 페이지 디폴트는 1
    var currentPage= 1;
    // 누군가 페이지 아래 링크 누르면 currentPage 파라미터가 넘어옴
    if(request.query.currentPage!=undefined){
       currentPage =request.query.currentPage;
    }
    var sql="select product_id, s.subcategory_id, sub_name, product_name";
    sql+=", price, brand, filename";
    sql+=" from subcategory s,  product p";
    sql+=" where s.subcategory_id = p.subcategory_id";


    var con= mysql.createConnection(conStr);
    con.query(sql,function(err,result,fields){
        if(err){
            console.log("목록 불러오기 실패",err);
        }else{
            console.log(result);
            response.render("admin/product/list",{
                param:{
                    "currentPage":currentPage,
                    "record":result
                }
            });
        }
        con.end
    });
});

/*------------------------ 클라이언트 측 요청처리 ------------------------*/

// 메인
app.get("/zinoshop/main", function(req, res){
    // 네비게이션의 카테고리 가져오기
    var sql="select * from topcategory";
    var con= mysql.createConnection(conStr);
    con.query(sql,function(error,result,fields){
        if(error){
            console.log("최상위 카테고리 가져오기 실패",error);
        }else{
            res.render("shop/index",{
                "topList":result
            });
        }
        con.end();
    });
});
// 쇼핑 상품 목록
app.get("/zinoshop/list", function(req, res){
    var sql="select * from topcategory";
    var con= mysql.createConnection(conStr);
    con.query(sql,function(error,result,fields){
        if(error){
            console.log("상품목록 실패",error);
        }else{
            res.render("shop/shop",{
                "topList":result
            });
        }
        con.end();
    });
});


/*------------------------ 세션 체크 ------------------------*/
function checkAdminSession(request,url,response){
    /*
    인증받은 관리자의 정보를 DB가 아닌 메모리 영역 세션을 통해 가져오기
    인증 과정을 수행했는지 여부는 
    request.session.변수 객체에 개발자가 의도한 변수가 존재하는지 여부로 판단
    */
   if(request.session.admin){ // request.session.user!=undefined라면
    response.render(url,{
        adminUser:request.session.admin
    });
    }else{
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        // 이전 화면으로 강제로 돌리기 history.back()
        response.end(mymodule.getMsgUrl("관리자 인증이 필요한 서비스입니다.","/admin/loginform"))
    }
}



// 서버 가동
var server= http.createServer(app);
server.listen(9999,function(){
    console.log("Shoppingmall server is running at 9999 port");
});