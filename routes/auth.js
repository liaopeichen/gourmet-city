const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../controllers/auth");
const { storeReturnTo } = require("../middleware");

router.route("/register").get(auth.renderRegisterForm).post(auth.register);

router
  .route("/login")
  .get(auth.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    auth.login
  );

router.get("/logout", auth.logout);

module.exports = router;
