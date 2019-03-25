


var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var ItemSchema = mongoose.Schema({
	    name: {type: String, index: 'hashed', 'default':''}
		, coffeeshopId: {type: String, 'default':''}
		, itemId: {type: String, 'default':''}
		, price: {type: String, 'default':''}
	    , created_at: {type: Date, index: {unique: false}, 'default': Date.now}
	    , updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	});
	
	
	//
	// 필요한 메소드 정의
	//
	
	
	// 모델을 위한 스키마 등록
	mongoose.model('Item', ItemSchema);
	
	console.log('CoffeeShopSchema 정의함.');

	return ItemSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;