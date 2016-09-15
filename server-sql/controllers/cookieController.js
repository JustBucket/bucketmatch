
let cookieController = {};
cookieController.setCookie = setCookie;

function setCookie(req, res, next) {
	res.cookie('userID', req.body.user_id, { httpOnly: true });
	res.cookie('token', req.body.access_token, { httpOnly: true });
	next()
}

module.exports = cookieController;