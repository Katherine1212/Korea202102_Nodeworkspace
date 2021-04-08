var http= require("http"); // 기본
var fs= require("fs"); // 파일 읽기
var ejs= require("ejs"); // 랜더링 위해
var express= require("express"); // 외부
var app= express(); // express 객체 생성
// 클라이언트가 업로드한 바이너리 데이터 처리를 위한 모듈
var multer= require("multer"); // 외부
var path= require("path"); // 내부 (파일의 경로와 관련되어 유용한 기능 보유. 확장자 추출가능)
/*
// Oracle 모듈
var oracledb= require("oracledb"); // 외부
*/
// Mysql 모듈
var mysql= require("mysql");
var mymodule= require("./lib/mymodule.js");

// 각종 필요한 미들웨어 적용
app.use(express.static(__dirname+"/static")); // 정적자원 위치
/* 업로드 모듈을 이용한 업로드 처리
storage:저장 할 곳,
destination: 저장 할 위치
filename: 저장 할 파일 이름
*/
var upload= multer({
    storage: multer.diskStorage({
        destination:function(request, file, cb){
            cb(null,__dirname+"/static/upload");
        },
        filename:function(request, file, cb){
            // 업로드 한 파일에 따라서 확장자도 달라짐.즉, 프로그래밍적으로 정보 추출
            // path.extname(file.originalname) 사용하여 파일의 확장자만 추출
             cb(null,new Date().valueOf()+path.extname(file.originalname));
        }
    })
})
/*
// Oracle 접속 정보
var conStr={
    user:"node",
    password:"node",
    connectString:"localhost/XE"
};
*/
// Mysql 접속 정보
var conStr={
    url:"localhost:3306",
    user:"root",
    password:"1234",
    database:"nodejs"
};
// 글 목록 요청처리
app.get("/gallery/list",function(request,response){
    var con= mysql.createConnection(conStr);
    var sql= "select * from gallery order by gallery_id desc"; // 내림차순
    con.query(sql,function(error,result,fields){
        if(error){
            console.log(error);
        }else{ 
            fs.readFile("./gallery/list.ejs","utf8",function(err,data){
                if(err){
                    console.log(err);
                }else{
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(ejs.render(data,{
                        galleryList:result,
                        lib:mymodule
                    }));
                }
            });
        }
        con.end(); // mysql 종료
    });
});
// 글등록 요청 처리
app.post("/gallery/regist",upload.single("pic"),function(request,response){ // 등록 요청 처리
    /*
    // oracle 접속
    oracledb.getConnection(conStr,function(error,connect){
        if(error){
            console.log(error);
        }else{
            console.log("접속성공");
        }
    });
    */
   // 파라미터 받기
   var title=request.body.title;
   var writer=request.body.writer;
   var content=request.body.content;
   var filename=request.file.filename; // multer 이용하여 기존 req객체에 추가된 것
   // Mysql 접속
    var con= mysql.createConnection(conStr);
    var sql= "insert into gallery(title, writer, content, filename) values(?,?,?,?)";
    con.query(sql,[title,writer,content,filename],function(error,fields){
        if(error){
            console.log(error);
        }else{
            response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
            response.end(mymodule.getMsgUrl("등록 완료","/gallery/list"));
        }
        con.end(); // mysql 종료
    });

}); 
// 상세 보기 요청
app.get("/gallery/detail",function(request,response){
    var con= mysql.createConnection(conStr);
    var gallery_id= request.query.gallery_id;
    var sql= "select * from gallery where gallery_id="+gallery_id;
    con.query(sql,function(error,result,fields){
        if(error){
            console.log(error);
        }else{
            // 상세 페이지 보여주기
            fs.readFile("./gallery/detail.ejs","utf8",function(err,data){
                if(err){
                    console.log(err);
                }else{
                    var resultRender=ejs.render(data,{
                        gallery:result[0] // result 가 한 건의 데이터만 담고있더라도 배열이니까
                    });
                    response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
                    response.end(resultRender);
                }
            });
        }  
        con.end(); // mysql 종료 
    })
});
// 삭제 요청 처리(DB삭제+이미지 삭제)
app.get("/gallery/delet",function(request,response){
    var gallery_id= request.query.gallery_id; // post방식의 파라미터
    var filename= request.query.filename;
    var sql= "delete * from gallery where gallery_id=?"+gallery_id;
    // var con= mysql.createConnection(conStr);
    fs.unlink(__dirname+"/static/upload/"+filename,function(error){
        if(error){
            console.log(error);
        }else{
            
        }
    }); // 삭제
    response.end(sql);
});
var server=http.createServer(app);
server.listen(9999,function(){
    console.log("Gallery server is running at 9999 port");
});