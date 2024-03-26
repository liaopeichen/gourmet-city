const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  return res.render("auth/register");
};

module.exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Gourmet City!");
      return res.redirect("/destinations");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  return res.render("auth/login");
};

module.exports.login = (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  const redirectUrl = res.locals.returnTo || "/destinations";
  req.session.returnTo = null;
  return res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    return res.redirect("/destinations");
  });
};
