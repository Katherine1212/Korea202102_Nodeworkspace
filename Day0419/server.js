var http= require("http");
var static= require("serve-static");// 외부모듈
var express= require("express"); // 외부모듈
var request= require("request"); // 외부모듈
var app= express();
app.use(static(__dirname+"/static")); // 정적자원 루트 등록
app.get("/tourSpot",function(req,res){
    // 요청이 들어오면 클라이언트가 우너하는 것은 우리서버의 데이터가 아니라 제3서버의 데이터를 원함.
    request({
        url: "https://tour.chungbuk.go.kr/openapi/tourInfo/stay.do",
        method: 'GET'
    }, function (error, response, body) {
        res.writeHead(200,{"Content-Type":"text/json;charset=utf-8"})
        res.end(body);
    });
});







var server= http.createServer(app);
server.listen(8888,function(){
    console.log("The API server is running at 8888 port ");
});