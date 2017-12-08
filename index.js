// aiml
AIMLInterpreter = require('./node_modules/aimlinterpreter/AIMLInterpreter');

var aimlInterpreter = new AIMLInterpreter({name:'Tam Nguyen', age:'23'});
aimlInterpreter.loadAIMLFilesIntoArray(['./aiml.xml']);


// Connect database
var mysql = require('mysql');

var conn = mysql.createConnection({
	host    : "45.117.169.92",
	user    : "dbquyen_travel",
	password: "Travelbot@123",
	database: "dbquyen_travelbot"
});

// messenger facebook
'use strict'

const logger = require('morgan');
const http = require('http');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.use(logger('dev'));

app.set('port', (process.env.PORT || 8080))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

var server = http.createServer(app);

// index
app.get('/', function (req, res) {
	res.send('Thiết lập webhook thành công!')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'tamnguyen') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAVV3f7r14EBAFnIdIky6ZCLHqLcUDiBHzoyPAGBhu8ZC5EQHgHZBZBi45JFgtiZBixZCpROzahl3fCjWBcAj9ZAiqRNVZBhdDQBHlWZB4df3sZCRouE2IPF7rduVNTDYOp5nKvFKfCcr4s07d96PAMR534l76ZBmVkElLf0tKLBkA8TAZDZD"

// bot reply when page has message
function sendTextMessage(sender, text) {
	let messageData = { text:text }

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// hiển thị dữ liệu từ bot
function findInfo(sender, answer) {
	var sql = "" + answer;
	conn.connect(function (err){
		conn.query(sql, function (err,results, fields) {
			if (err) {
				if (sql === "Du lịch") {
					DuLich(sender);
				}
				else if (sql === "Tìm địa điểm") {
					DiaDiem(sender);
				}
				else if (sql === "Tìm chỗ ngủ") {
					ChoNgu(sender);
				}
				else if (sql === "Tìm món ăn") {
					MonAn(sender);
				}
				else if (sql === "Tìm nhà hàng") {
					NhaHang(sender);
				}
				else if (sql === "Tìm quà tặng") {
					QuaTang(sender);
				}
				else if (sql === "Tìm hoạt động") {
					HoatDong(sender);
				}
				else if (sql === "Tìm khách sạn rẻ") {
					KhachSanRe(sender);
				}
				else if (sql === "Tìm khách sạn cao cấp") {
					KhachSanCaoCap(sender);
				}
				else if (sql === "Tìm lễ hội") {
					LeHoi(sender);
				}
				else if (sql === "Tiêu chí khách sạn Cần Thơ" || sql === "Tiêu chí khách sạn Bến Tre" || sql === "Tiêu chí khách sạn Đà Lạt") {
					HoTel(sender, sql);
				}
				else if (sql === "Tìm thông tin Bến Tre" || sql === "Tìm thông tin Đà Lạt" || sql === "Tìm thông tin Cần Thơ") {
					LuaChon(sender, sql);
				}
				else
					sendTextMessage(sender, answer);
			}
			else if (results[0]['food_hinhanh'] === undefined) {
				// sendTextMessage(sender, results[0]['food_ten']);
				sendTextMessage(sender, results[0]['food_diachi']);
			}
			else{
				sendTextMessage(sender, ";) Đây là kết quả có thể bạn quan tâm: ");

		    // khai báo mảng chứa lưu kết quả trả về
		    var ketqua = [];

		    // thêm từng phần tử vào mảng
		    for (var i = 0; i < results.length; i++) {
		    	var temp_kq = "";
		    	for (var j = 0; j < results[i]['food_ten'].length; j++) {
		    		temp_kq += Convert(results[i]['food_ten'][j]);
		    	}
		    	if (results[i]['web'] === undefined || results[i]['web'] === "") {
		    		ketqua.push(
		    		{
		    			"title": results[i]['food_ten'],
		    			"subtitle": results[i]['food_diachi'],
		    			"image_url": "hottps://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/" + results[i]['food_hinhanh'],
		    			"buttons": [{
		    				"title": "Xem Chi Tiết",
		    				"type": "postback",
		    				"payload": temp_kq
		    			}],
		    		}
		    		);
		    	}
		    	else{
		    		ketqua.push(
		    		{
		    			"title": results[i]['food_ten'],
		    			"subtitle": results[i]['food_diachi'],
		    			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/" + results[i]['food_hinhanh'],
		    			"buttons": [{
		    				"title": "Xem Chi Tiết",
		    				"type": "web_url",
		    				"url": results[i]['web']
		    			}],
		    		}
		    		);
		    	}
		    }

		    let messageData = {
		    	"attachment": {
		    		"type": "template",
		    		"payload": {
		    			"template_type": "generic",
		    			"elements": ketqua,
		    		}
		    	}
		    }
		    request({
		    	url: 'https://graph.facebook.com/v2.6/me/messages',
		    	qs: {access_token:token},
		    	method: 'POST',
		    	json: {
		    		recipient: {id:sender},
		    		message: messageData,
		    	}
		    }, function(error, response, body) {
		    	if (error) {
		    		console.log('Error sending messages: ', error)
		    	} else if (response.body.error) {
		    		console.log('Error: ', response.body.error)
		    	}
		    })
		}
	});
	});
}

// Hàm chọn địa điểm
function DiaDiem(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm loại địa điểm nào? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Ăn uống",
					"payload": "Tim mon an"
				},
				{
					"type": "postback",
					"title": "Qua Đêm",
					"payload": "Tim khach san"
				},
				{
					"type": "postback",
					"title": "Vui chơi",
					"payload": "Tim cho vui choi"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Tìm lễ hội
function LeHoi(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm lễ hội ở đâu? :)",
				"buttons":[
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Tim le hoi o Can Tho"
				},
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Tim le hoi o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Tim le hoi o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// Tìm khách sạn rẻ
function KhachSanRe(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm khách sạn rẻ ở đâu? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Tim khach san re o Can Tho"
				},
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Tim khach san re o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Tim khach san re o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Tìm khách sạn cao cấp
function KhachSanCaoCap(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm khách sạn cao cấp ở đâu? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Tim khach san cao cap o Can Tho"
				},
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Tim khach san cao cap o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Tim khach san cao cap o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// Tìm hoạt động
function HoatDong(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm các hoạt động vui chơi ở đâu? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Tim hoat dong o Can Tho"
				},
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Tim hoat dong o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Tim hoat dong o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// Tìm quà tặng
function QuaTang(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm mua quà ở đâu? :)",
				"buttons":[
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Tim qua o Can Tho"
				},
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Tim qua o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Tim qua o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// Hàm chọn button tìm địa điểm du lịch
function DuLich(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn đi du lịch ở đâu? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Du lich Can Tho"
				},
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Du lich Ben Tre"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Du lich Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Tiêu chí chọn khách sạn
function HoTel(sender, sql) {
	var ketqua = [];
	if (sql === "Tiêu chí khách sạn Cần Thơ") {
		ketqua.push(
		{
			"type": "postback",
			"title": "Rẻ",
			"payload": "Khach san re Can Tho"
		},
		{
			"type": "postback",
			"title": "Cao Cấp",
			"payload": "Khach san cao cap Can Tho"
		}
		);
	}
	else if (sql === "Tiêu chí khách sạn Bến Tre") {
		ketqua.push(
		{
			"type": "postback",
			"title": "Rẻ",
			"payload": "Khach san re Ben Tre"
		},
		{
			"type": "postback",
			"title": "Cao Cấp",
			"payload": "Khach san cao cap Ben Tre"
		}
		);
	}
	else {
		ketqua.push(
		{
			"type": "postback",
			"title": "Rẻ",
			"payload": "Khach san re Da Lat"
		},
		{
			"type": "postback",
			"title": "Cao Cấp",
			"payload": "Khach san cao cap Da Lat"
		}
		);
	}
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm khách sạn theo tiêu chí nào? :)",
				"buttons": ketqua,
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}


// Tìm nhà hàng
function NhaHang(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm chỗ ăn uống ở đâu? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Tim quan an o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Tim quan an o Can Tho"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Tim quan an o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Tìm chỗ ngủ
function ChoNgu(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm chỗ ngủ ở đâu? ;)",
				"buttons":[
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Cho ngu o Ben Tre"
				},
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Cho ngu o Can Tho"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Cho ngu o Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Tìm món ăn
function MonAn(sender) {
	let messageData = {
		"attachment":{
			"type":"template",
			"payload":{
				"template_type":"button",
				"text":"Bạn muốn tìm món ăn ở đâu? :)",
				"buttons":[
				{
					"type": "postback",
					"title": "Bến Tre",
					"payload": "Mon an Ben Tre"
				},
				{
					"type": "postback",
					"title": "Cần Thơ",
					"payload": "Mon an Can Tho"
				},
				{
					"type": "postback",
					"title": "Đà Lạt",
					"payload": "Mon an Da Lat"
				}
				]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// Lựa chọn các tiêu chí ở một địa điểm
function LuaChon(sender, sql) {
	var ketqua = [];
	if (sql === "Tìm thông tin Bến Tre") {
		sendTextMessage(sender, "Bạn muốn tìm thông tin gì ở Bến Tre ;)");

		ketqua.push(
		{
			"title": "Món ăn",
			"subtitle": "Thông tin về các món ngon của Bến Tre",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/comdua.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin mon an Ben Tre"
			}]
		},
		{
			"title": "Địa điểm vui chơi",
			"subtitle": "Thông tin về các địa điểm ở Bến Tre",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/ca.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin dia diem Ben Tre"
			}]
		},
		{
			"title": "Nhà hàng",
			"subtitle": "Thông tin về các nhà hàng ở Bến Tre",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/comhen.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin nha hang Ben Tre"
			}]
		},
		{
			"title": "Khách sạn",
			"subtitle": "Thông tin về khách sạn ở Bến Tre",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/vietuc.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin khach san Ben Tre"
			}]
		},
		{
			"title": "Quà tặng",
			"subtitle": "Thông tin về các quà tặng nên mua về",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/tcmn.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin qua tang Ben Tre"
			}]
		}
		);
	}
	else if (sql === "Tìm thông tin Cần Thơ") {
		sendTextMessage(sender, "Bạn muốn tìm thông tin gì ở Cần Thơ ;)");

		ketqua.push(
		{
			"title": "Món ăn",
			"subtitle": "Thông tin về các món ngon của Cần Thơ",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/banhcong.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin mon an Can Tho"
			}]
		},
		{
			"title": "Địa điểm vui chơi",
			"subtitle": "Thông tin về các địa điểm ở Cần Thơ",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/cncr.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin dia diem Can Tho"
			}]
		},
		{
			"title": "Nhà hàng",
			"subtitle": "Thông tin về các nhà hàng ở Cần Thơ",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/monngan.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin nha hang Can Tho"
			}]
		},
		{
			"title": "Khách sạn",
			"subtitle": "Thông tin về khách sạn ở Cần Thơ",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/muongthanh.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin khach san Can Tho"
			}]
		},
		{
			"title": "Quà tặng",
			"subtitle": "Thông tin về các quà tặng nên mua về",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/rm.png",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin qua tang Can Tho"
			}]
		}
		);
	}
	else{
		sendTextMessage(sender, "Bạn muốn tìm thông tin gì ở Đà Lạt ;)");

		ketqua.push(
		{
			"title": "Món ăn",
			"subtitle": "Thông tin về các món ngon của Đà Lạt",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/banhcan.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin mon an Da Lat"
			}]
		},
		{
			"title": "Địa điểm vui chơi",
			"subtitle": "Thông tin về các địa điểm ở Đà Lạt",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/hxh.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin dia diem Da Lat"
			}]
		},
		{
			"title": "Nhà hàng",
			"subtitle": "Thông tin về các nhà hàng ở Đà Lạt",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/monngan.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin nha hang Da Lat"
			}]
		},
		{
			"title": "Khách sạn",
			"subtitle": "Thông tin về khách sạn ở Đà Lạt",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/ks5.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin khach san Da Lat"
			}]
		},
		{
			"title": "Quà tặng",
			"subtitle": "Thông tin về các quà tặng nên mua về",
			"image_url": "https://raw.githubusercontent.com/ngtambt94/TravelBot/master/source/img/dautay.jpg",
			"buttons": [{
				"type": "postback",
				"title": "Chi Tiết",
				"payload": "Thong tin qua tang Da Lat"
			}]
		}
		);
	}
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": ketqua
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}



// chuyển đổi tiếng việt không dấu và loại bỏ dấu câu
function Convert(str){
	str = str.toLowerCase();
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
	str = str.replace(/đ/g, "d");
	str = str.replace(/!|\?|\.|;|,/g, "");
	str = str.toUpperCase();
	return str;
}


// to post data
app.post('/webhook', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		let check = /[0-9()^;:_<>*|./?!@#$%&`~+='"\-{}]{1,1000}$/;

    // kiểm tra sự kiện có tin nhắn đến
    if (event.message && event.message.text) {
    	let text = event.message.text
    	let temp = "";
    	for (var j = 0; j < text.length; j++) {
    		temp += Convert(text[j]);
    	}
      // hàm callback trả về đáp án
      var callback = function(answer, wildCardArray, input){
      	if (text.match(check)) {
      		sendTextMessage(sender, "Vui lòng không nhập chữ số và ký tự đặc biệt! ;)");
      	}
      	else if (answer !== undefined && answer !== '') {
      		findInfo(sender, answer);
      	}
      	else if (answer === '') {
      		sendTextMessage(sender, "Bên mình chưa có dữ liệu :P");
      	}       
      	else{
      		sendTextMessage(sender, text+" là gì dạ mình hỏng hiểu. Nhập help đi nè :P");
      	}
      };

      // kiểm tra text với file aiml
      aimlInterpreter.findAnswerInLoadedAIMLFiles(temp, callback)
  }
  if (event.postback) {
  	let text = event.postback.payload

  	var callback = function(answer, wildCardArray, input){
  		findInfo(sender, answer);
  	};

  	aimlInterpreter.findAnswerInLoadedAIMLFiles(text, callback)
  }
}
res.sendStatus(200)
})


// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('Tam Nguyen\'s Chatbot is listening at', app.get('port'))
})
