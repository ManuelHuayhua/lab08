const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Joi = require('joi');

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// Configuración del esquema de validación
const validationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required().messages({
    'string.email': 'El correo electrónico debe ser válido para la creacion'
  }),
  password: Joi.string().required()
});

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});

router.post('/', async (req, res) => {
  try {
    // Validar los datos de entrada
    const { error } = validationSchema.validate(req.body);
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.render('error', { errorMessages });
    }

    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();
    res.redirect('/users');
  } catch (error) {
    // Manejar errores de la base de datos u otros errores
    console.error(error);
    res.redirect('/users'); // Redirigir a una página de error o hacer otra acción adecuada
  }
});

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(req.params.id, {
    name,
    email,
    password: hashedPassword
  });
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
