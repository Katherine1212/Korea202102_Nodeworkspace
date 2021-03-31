/* Node.js 는 브라우저가 탑제된 JS와는 목적이 다르다.
즉, 응용 프로그램 개발 중 주로 서버 개발 시 많이 사용

Node.js는 자체적으로 많은 기능을 가지진 못함.
따라서 주로 모듈을 이용하여 프로그램 개발
*/
// 웹기본 서버모듈. 이 모듈만 있으면 기본적인 웹서버 구축 가능
var http=require("http");
var server= http.createServer(); // 서버 객체 생성

// 생성된 서버 객체를 이용하여 서버를 가동.(server.listen(포트번호,function());)
server.listen(9999,function(){
    console.log("My server is running at 9999 port...");
});