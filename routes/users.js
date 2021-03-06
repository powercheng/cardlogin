var express = require('express');
var User = require('../models/user.js');
var Card = require('../models/card.js');
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();

router.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
});

router.get("/", ensureAuthenticated, function(req, res, next) {
/*	Card.find()
	.sort({ createdAt: "descending" })
	.exec(function(err, cards) {
		if (err) { return next(err); }*/
	res.render("index");
	});

/*router.get("/test.html", ensureAuthenticated, function(req, res, next) {
	next();
});*/

router.get("/signup", function(req, res) {
	res.render("signup");
});

router.post("/signup", function(req, res, next) {
	var username = req.body.username;
	var password = req.body.password;
	User.findOne({ username: username }, function(err, user) {
		if (err) { return next(err); }
		if (user) {
			req.flash("error", "User already exists");
			return res.redirect("/signup");
		}
		var newUser = new User({
			username: username,
			password: password
		});
		console.log(newUser);
		newUser.save(next);
	});
}, passport.authenticate("login", {
	successRedirect: "/",
	failureRedirect: "/signup",
	failureFlash: true
}));

router.get("/login", function(req, res) {
	res.render("login");
});

router.post("/login", passport.authenticate("login", {
	successRedirect: "/",
	failureRedirect: "/login",
	failureFlash: true
}));

router.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/login");
});

router.get("/users/:username", function(req, res, next) {
	User.findOne({ username: req.params.username }, function(err, user) {
		if (err) { return next(err); }
		if (!user) { return next(404); }
		res.render("profile", { user: user });
	});
});

/*router.get("/edit", ensureAuthenticated, function(req, res) {
	res.render("edit");
});*/

/*router.post("/edit", ensureAuthenticated, function(req, res, next) {
	req.user.displayName = req.body.displayname;
	req.user.bio = req.body.bio;
	req.user.save(function(err) {
		if (err) {
			next(err);
			return;
		}
		req.flash("info", "Profile updated!");
		res.redirect("/edit");
	});
});*/

passport.use("login", new LocalStrategy(
	function(username, password, done) {
		User.findOne({ username: username }, function(err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false,
					{ message: "该用户不存在" });
			}
			console.log(user);
			user.checkPassword(password, user.password, function(err, isMatch) {
				if (err) { return done(err); }
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false,{ message: "密码错误" });
				}
			});
		});
	}));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.flash("info", "请先登录");
		res.redirect("/login");
	}
}

module.exports = router;