const db = require("../db/pool");
const bcrypt = require("bcryptjs");
const { validationResult, body } = require("express-validator");
const passport = require("passport");

// ---------- Validatori per il form di registrazione ----------
const signUpValidators = [
  body("first_name")
    .trim()
    .notEmpty().withMessage("Il nome è obbligatorio"),

  body("last_name")
    .trim()
    .notEmpty().withMessage("Il cognome è obbligatorio"),

  body("email")
    .trim()
    .isEmail().withMessage("Inserisci un'email valida"),

  body("password")
    .isLength({ min: 6 }).withMessage("La password deve avere almeno 6 caratteri"),

  body("confirm_password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Le password non coincidono");
      }
      return true;
    }),
];



// ---------- GET /sign-up ----------
const getSignUp = (req, res) => {
  res.render("sign-up", { errors: [] });
};

// ---------- POST /sign-up ----------
const postSignUp = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("sign-up", { errors: errors.array() });
  }

  try {
    const { first_name, last_name, email, password, admin_secret } = req.body;

    // ---------- Hash della password ----------
    const hashedPassword = await bcrypt.hash(password, 10);

    // Controlla se ha inserito la password admin
    const isAdmin = admin_secret === process.env.ADMIN_SECRET;

    // ---------- Salva nel database ----------
    await db.query(
      "INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES ($1, $2, $3, $4, $5)",
      [first_name, last_name, email, hashedPassword, isAdmin]
    );

    res.redirect("/");
  } catch (err) {
    console.error("Errore dettagliato:", err.message);
    res.render("sign-up", { errors: [{ msg: "Email già in uso o errore del server" }] });
  }
};


// ---------- GET /log-in ----------
const getLogIn = (req, res) => {
  res.render("log-in", { error: req.query.error || null });
};

// ---------- POST /log-in ----------
const postLogIn = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in?error=Credenziali+non+valide",
});

// ---------- GET /log-out ----------
const logOut = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};

// ---------- GET /join-club ----------
const getJoinClub = (req, res) => {
  if (!req.user) return res.redirect("/log-in");
  res.render("join-club", { error: null, success: null });
};

// ---------- POST /join-club ----------
const postJoinClub = async (req, res) => {
  if (!req.user) return res.redirect("/log-in");

  const { secret } = req.body;

  if (secret !== process.env.CLUB_SECRET) {
    return res.render("join-club", {
      error: "Password segreta errata!",
      success: null,
    });
  }

  try {
    await db.query(
      "UPDATE users SET membership_status = TRUE WHERE id = $1",
      [req.user.id]
    );
    res.render("join-club", {
      error: null,
      success: "Benvenuto nel club! 🎉 Ora puoi vedere chi ha scritto i messaggi.",
    });
  } catch (err) {
    console.error(err);
    res.render("join-club", {
      error: "Errore del server",
      success: null,
    });
  }
};

// ---------- GET /new-message ----------
const getNewMessage = (req, res) => {
  if (!req.user) return res.redirect("/log-in");
  res.render("new-message", { errors: [] });
};

// ---------- POST /new-message ----------
const postNewMessage = [
  body("title").trim().notEmpty().withMessage("Il titolo è obbligatorio"),
  body("text").trim().notEmpty().withMessage("Il testo è obbligatorio"),

  async (req, res) => {
    if (!req.user) return res.redirect("/log-in");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("new-message", { errors: errors.array() });
    }

    try {
      const { title, text } = req.body;
      await db.query(
        "INSERT INTO messages (title, text, user_id) VALUES ($1, $2, $3)",
        [title, text, req.user.id]
      );
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.render("new-message", { errors: [{ msg: "Errore del server" }] });
    }
  }
];

// ---------- GET / — carica tutti i messaggi ----------
const getIndex = async (req, res) => {
  console.log("User:", req.user); 
  try {
    const { rows: messages } = await db.query(`
      SELECT messages.id, messages.title, messages.text, messages.created_at,
             users.first_name, users.last_name
      FROM messages
      JOIN users ON messages.user_id = users.id
      ORDER BY messages.created_at DESC
    `);
    res.render("index", { user: req.user || null, messages });
  } catch (err) {
    console.error(err);
    res.render("index", { user: req.user || null, messages: [] });
  }
};

// ---------- POST /messages/:id/delete ----------
const deleteMessage = async (req, res) => {
  if (!req.user || !req.user.is_admin) return res.redirect("/");

  try {
    await db.query("DELETE FROM messages WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
};

module.exports = {
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
};