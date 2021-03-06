const mongoose = require('mongoose');
var moment = require('moment');
require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

const notificationSchema = new mongoose.Schema({
	notification_type: { type: String, required: true},
	date: Date,
    user_idx: { type: Array, required: true},
    article_idx: { type: Array, required: true}
}, {
    versionKey: false
});

// 유저 해당 알림 가져오기
notificationSchema.statics.findByUserIdx = function(user_idx) {
    return this.find({
		'user_idx' : { "$elemMatch" : {'user_idx' : user_idx}}
	});
};

notificationSchema.statics.updateFlag = function(user_idx){
	return this.update({
		'user_idx' : { "$elemMatch" : {'user_idx' : user_idx}}
	})
}

notificationSchema.statics.createWithDate = function(user){
	return this.create({
		'user_idx': userData,
		'article_idx': articleArr,
		'notification_type': num,
		'date': moment().format('YYYY-MM-DD HH:mm:ss')
	})
}
// user_idx,
// 'article_idx' : article_idx,
// 'notification_type' : notification_type
notificationSchema.pre('save', function(next) { 
    this.date = moment().format('YYYY-MM-DD HH:mm:ss');
});

module.exports = mongoose.model('notification', notificationSchema);