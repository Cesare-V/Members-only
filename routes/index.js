const express = require("express");
const router = express.Router();
const {
  signUpValidators,
  getSignUp,
  postSignUp,
  getLogIn,
  postLogIn,
  logOut,
  getJoinClub,
  postJoinClub,
  getNewMessage,
  postNewMessage,
  getIndex,
  deleteMessage,
} = require("../controllers/indexController");


router.get("/", getIndex);

router.get("/sign-up", getSignUp);
router.post("/sign-up", signUpValidators, postSignUp);

router.get("/log-in", getLogIn);
router.post("/log-in", postLogIn);
router.get("/log-out", logOut);

router.get("/join-club", getJoinClub);
router.post("/join-club", postJoinClub);

router.get("/new-message", getNewMessage);
router.post("/new-message", postNewMessage);

router.post("/messages/:id/delete", deleteMessage);

module.exports = router;
