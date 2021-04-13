var oracledb= require("oracledb");
var conStr={
    user:"node",
    password:"node",
    connectString:"localhost/XE" // localhost:1521가 아니면 포트번호 필히 명시
}
// 접속
oracledb.getConnection(conStr,function(err,con){ // 접속 성공시 커넥션 객체 반환
    if(err){
        console.log("접속 실패",err);
    }else{
        console.log("접속 성공");
    }
});