const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, validateToken } = require("../config/token");
const { validateUser } = require("../config/auth");

router.post("/register", (req, res) => {
  User.create(req.body).then((newUser) => res.status(201).send(newUser));
});

router.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  User.findOne({ where: { email: email } }).then((user) => {
    if (!user) return res.status(401).send("no se encontro el usuario");

    user.validatePassword(password).then((result) => {
      if (!result) return res.sendStatus(401);
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
      };
      const token = generateToken(payload);
      res.cookie("token", token);
      res.send(payload);
    });
  });
});
router.get("/favorites/:email", (req, res) => {
  const email = req.params.email;
  User.findOne({ where: { email: email } })
    .then((user) => {
      res.status(200).send(user.favorites);
    })
    .catch((error) => console.error(error));
});
router.post("/favorites", (req, res) => {
  const email = req.body.email;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user) {
        const existingId = user.dataValues.favorites.indexOf(
          req.body.newFavorite
        );
        existingId !== -1
          ? user.dataValues.favorites.splice(existingId, 1)
          : user.dataValues.favorites.push(req.body.newFavorite);
        User.update(
          { favorites: user.dataValues.favorites },
          {
            where: { email: req.body.email },
            returning: true,
          }
        ).then(() => res.sendStatus(201));
      } else res.status(404).send("usuario no encontrado");
    })
    .catch((error) => console.error(error));
});

router.get("/favorites/exist/:email/:id", (req, res, next) => {
  const email = req.params.email;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (user && user.dataValues.favorites) {
        if (user.dataValues.favorites.includes(parseInt(req.params.id))) {
          res.sendStatus(200);
        } else {
          next();
        }
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => res.sendStatus(500));
});

router.post("/logout", validateUser, (req, res) => {
  res.clearCookie("token");
  res.sendStatus(204);
});

router.get("/all", (req, res) => {
  User.findAll()
    .then((response) => res.status(200).send(response))
    .catch((err) => console.error(err));
});

router.get("/me", validateUser, (req, res) => {
  res.send(req.user);
});

module.exports = router;
