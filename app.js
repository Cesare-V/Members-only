require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("./db/pool");

const indexRouter = require("./routes/index");

const app = express();

// ---------- View Engine ----------
app.set("view engine", "ejs");

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// ---------- Sessione ----------
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// ---------- Passport ----------
passport.use(new localStrategy(
  { usernameField: "email" }, // usiamo email invece di username
  async (email, password, done) => {
    try {
      const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Email non trovata" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Password errata" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// --------- Serializzazione: salva l'id utente nella sessione ---------
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializzazione: ricarica l'utente dal DB ad ogni richiesta
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

app.use(passport.initialize());
app.use(passport.session());


// ---------- Routes ----------
app.use("/", indexRouter);

// ---------- Avvia il server quindi ascolta ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));