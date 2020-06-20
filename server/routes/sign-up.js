const express = require('express');
const router = express.Router();
const { uniqueId } = require('lodash');

const users = [];

router.post('/', (req, res) => {
  const isEmailAlreadyHave = users.some((user) => user.email === req.body.email);
  
  const { name, password, email, website, age, skills } = req.body;

  const newUser = {
    id: uniqueId(),
    name,
    password,
    email,
    website,
    age,
    skills,
  }

  // если такой мейл уже есть выкидываем ошибку
  if (isEmailAlreadyHave) {
    return res.status(400).send({ field: 'email', message: 'Такой email уже существует' });
  }

  // если все норм то возвращаем массив юзеров
  users.push(newUser);
  res.json(users);
});

module.exports = router;