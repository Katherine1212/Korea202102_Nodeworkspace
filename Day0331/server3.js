/*
클라이언트의 요청에 대해 응답 하기.(요청에 응답하지 않으면 클라이언트는 무한 응답 대기 상태)
*/ 
var http=require("http");
var server=http.createServer(function(request,response){
    /* 앞으로 클라이언트의 요청 및 그 요청에 대한 응답 처리를 익명함수로 가능 */
    // 테이블 태그를 클라이언트에서 전송~
    var tag="<table border='1px'>";
    tag+="<tr>";
    tag+="<td>Apple</td>";
    tag+="<td>Orange</td>";
    tag+="</tr>";
    tag+="</table>";
    // 응답 보내기
    response.end(tag); // 웹브라우저가 해석 할 수 있는 데이터로 보내기
});
// 서버 가동하여 클라이언트 접속을 기다리기
server.listen(9999,function(){
    console.log("3rd server is running at 9999port");
});