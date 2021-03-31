/*
클라이언트의 요청을 받을 웹서버를 구축()
*/
var http=require("http"); // http 웹서버 모듈 가져오기
var server= http.createServer(); // 서버 객체 생성
// 클라이언트의 접속 감지
server.on("connection",function(){
    console.log("Client connect");
});

server.on();
server.listen(9999,function(){
    console.log("second server is running ar 9999");
}); // 클라이언트의 접속 기다리기