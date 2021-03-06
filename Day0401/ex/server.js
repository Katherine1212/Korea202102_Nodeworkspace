/* Node.js는 웹브라우저에서 사용되는 js문법을 거의 그대로 사용하기 때문에
자체적인 능력에 한계가 있다. 하지만, 모듈을 통해 엄청난 확장성을
갖고있다. (전세계 개발자들에 의해 모듈이 오픈소스로 공유된다.) */

// 기본적인 웹서버 모듈 가져오기
// http 등의 모듈은 이미 node.js 설치 시 함께 포함 된다. 이러한 내장된 모듈을 가리켜 내장 모듈이라고 함.
var http= require("http"); // 내장 모듈
// 사용자 정의 모듈 가져오자(my module 에서 끌고오기)
var msg=require("./my module.js");

var server=http.createServer(function(req,response){
    /* request(req): 클라이언트의 요청정보를 담고 있는 객체
        response: 클라이언트에 응답할 정보를 담고있는 객체
     */
    response.end(msg.getMsg());
}); // 서버 객체 생성
/*
네트워크 프로그램간 식별을 위한 구분 
고유값 1~1024 사이의 포트는 이미 사용 중인 포트번호.(ex. 21 FTP)
또한, 상용 프로그램이 이미 사용중인 포트도 피하자(oracle-1521, mysql-3306, mssql-1433)
*/
server.listen(9999,function(){
    console.log("my server is running at 9999");
}); // 서버 가동