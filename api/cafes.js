
var router = require('express').Router();
const randomstring = require('randomstring');
const Cafe = require('../models/model_cafe');
const User = require('../models/model_user');
const util = require('../util');


// 카페 등록 - 스테프로 로그인해야 한다
router.post('/', util.isLoggedin, util.isStaff, (req, res) => {
	console.log('POST api/cafe/register called');
  
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    // 일단 사장님 한 명이 카페 하나만 소유하도록 한다.
    // 매장을 두 개 이상 운영하는 경우는 추후에 수정...
    if (user.cafeId) return res.status(400).json(util.successFalse(null, '이미 등록된 카페가 있습니다.'));
    
    // 같은 매장의 중복 등록을 방지한다.
    Cafe.findOne({name:req.body.name, address:req.body.address, tel:req.body.tel}, (err, cafe) => {
      
      if (err) return res.status(500).json(util.successFalse(err));
      if (cafe) return res.status(400).json*util.successFalse(null, '이미 등록된 카페입니다.');
      
      if (req.body.latitude > 90) req.body.latitude -= 90;
      if (req.body.longitude > 90) req.body.longitude -= 90;

      var newCafe = new Cafe(req.body);
      newCafe.geometry.coordinates = [req.body.latitude,req.body.latitude];
      newCafe.cafeId = randomstring.generate(16);

      user.myOwnCafeId = newCafe.cafeId;
      newCafe.ownerId = user.userId;

      user.save()
          .catch(err => res.status(500).json(util.successFalse(err)));
      
      // save()로 저장
      newCafe.save((err, cafe) => {
        if (err) return res.status(500).json(util.successFalse(err));
        if (!cafe) return res.status(404).json(util.successFalse(null, '커피숍 등록 실패')); 
        res.status(200).json(util.successTrue(cafe));
      });
    });
  });  
});

// 카페 리스트 가져오기
router.get('/', (req, res) => {
	console.log('GET /api/cafe called');
 
  Cafe.find({"deprecated":false}, (err, cafes) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!cafes) return res.status(404).json(util.successFalse(null, '등록된 카페가 없습니다.'));
    res.status(200).json(util.successTrue(cafes));
  });
	
  /*
  for (var i = 0; i < results.length; i++) {
    var curName = results[i]._doc.name;
    var curAddress = results[i]._doc.address;
    var curTel = results[i]._doc.tel;
    var curLongitude = results[i]._doc.geometry.coordinates[0];
    var curLatitude = results[i]._doc.geometry.coordinates[1];
  }	
  */
  
});

// 가까운 커피숍 10개 조회
router.get('/near', (req, res) => {
	console.log('cafe 모듈 안에 있는 findNear 호출됨.');
  
	var maxDistance = 3000;
  var longitude = req.query.longitude;
  var latitude = req.query.latitude;
	
  console.log('요청 파라미터 : ' + longitude + ', ' + latitude);
		// 가까운 커피숍 10개 검색
  Cafe.findNear(longitude, latitude, maxDistance, 10, (err, cafes) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafes) return res.status(404).json(util.successFalse(null, '주변에 예약 주문이 가능한 카페가 없습니다.ㅠㅠ'));
    res.status(200).json(util.successTrue(cafes));
  });
  
});

// 카페 상세정보 가져오기
router.get('/:cafeId', (req, res) => {
  console.log('GET /:cafeId called');
  Cafe.findById(req.params.cafeId, (err, cafe) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    res.status(200).json(util.successTrue(cafe));
  });
});


// 카페 정보 수정
router.put('/:cafeId', util.isLoggedin, util.isStaff, (req, res) => {
  console.log('PUT /:cafeId called');
  Cafe.findById(req.params.cafeId, (err, cafe) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    for (var p in req.body) {
			cafe[p] = req.body[p];
		}
    cafe.updated_at = Date.now;
    cafe.save((err, cafe) => {
      if (err) return res.status(400).json(util.successFalse(err, '카페 정보 수정 실패'));
      res.status(200).json(util.successTrue(cafe));
    }); 
  });
});


// 카페 탈퇴
router.put('/:cafeId/unregister', util.isLoggedin, util.isOwner, (req, res) => {
  console.log('PUT /:cafeId/unregister called');
  Cafe.findById(req.params.cafeId, (err, cafe) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    cafe.deprecated = true;
    cafe.updated_at = Date.now;
    cafe.save((err, cafe) => {
      if (err) return res.status(400).json(util.successFalse(err, '카페 탈퇴 실패'));
      res.status(200).json(util.successTrue(cafe));
    }); 
  });
});





module.exports = router;