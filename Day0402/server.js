var http= require("http"); // http 내장모듈
var fs=require("fs"); // 파일제어하는 내장모듈

var server=http.createServer(function(request,response){
    // request: 클라이언트의 요청 정보
    /* fs.readFile("파일명","인코딩", 읽었을 때 실행 할 함수) */

    fs.readFile("./regi_form.html","utf8", function(err,data){
        /* response: 클라이언트에게 보낼 응답 정보
         http의 형식을 갖추어 클라이언트에게 응답하자. 
         response.writeHead(응답코드{"콘텐트 타입":"/html;utf-8(영어외 언어 작성시)"});
         응답 코드는 200번대가 긍정 500번대가 실패
        */
        response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
        response.end(data);

    });
});

server.listen(8888,function(){
    console.log("server is runnint at 8888");
});