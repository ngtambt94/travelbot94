AIMLInterpreter = require('./node_modules/aimlinterpreter/AIMLInterpreter');

var aimlInterpreter = new AIMLInterpreter({name:'Tam Nguyen', age:'23'});
aimlInterpreter.loadAIMLFilesIntoArray(['./aiml.xml']);

var mysql = require('mysql');

var conn = mysql.createConnection({
  host    : "45.117.169.92",
  user    : "dbquyen_travel",
  password: "Travelbot@123",
  database: "dbquyen_travelbot"
});

var x = [];
var sql = "SELECT food_ten, food_diachi from foods where food_id = 1";
conn.connect(function (err){
  //nếu có nỗi thì in ra
  // if (err) throw err.stack;
  //nếu thành công
  // var sql = "hello";    
  conn.query(sql, function (err,results, fields) {
    // if (err) throw err;
    if (results[0]['hinhanh'] === undefined) {
      console.log(results[0]['food_ten']);
    }
    else{
      for (var i = 0; i < results.length; i++) {
        console.log(results[i].length);
      }
    }
    
    // console.log(x);
  });

});
