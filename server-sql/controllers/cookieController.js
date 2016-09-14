
let cookieController = {};
cookieController.setCookie = setCookie;

function setCookie(req, res, next) {
	res.cookie('userID', req.body.user_id);
	res.cookie('token', req.body.access_token);
	next()
}

module.exports = cookieController;