const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const SECRET_KEY = "sin-animo-de-lucro-tu-que-prefieres-un-pincho-o-una-tortilla-de-patatas";

const { AsistedDays, Users, Routines, MuscularGroup, Exercises } = require('./models');

const {
    createItem,
    updateItem,
    deleteItem,
    readItem,
    readItems
  } = require('./generics'); 



//USERS

router.get('/users', async (req, res) => await readItems(req, res, Users));

router.post('/register', async (req, res) => {
    try {
      const { name, password } = req.body;
    
      console.log('me llega', name, password)
      const existingUser = await Users.findOne({ where: { name } });
      if (existingUser) {
        return res.status(402).json({ error: 'Nombre existe' });
      }

      const newUser = await Users.create({ name, password });

      const token = jwt.sign({ name: name }, SECRET_KEY, { expiresIn: '2h' }); 
      res.cookie('token', token, { httpOnly: false, maxAge: 7200000 }); 
  
      res.json({ message: 'Register hecho', name: newUser.name });
    
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
      const user = await Users.findOne({ where: { name } });
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Contrasenya mal' });
      }

      res.json({ name: user.name });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//MUSCULAR GROUPS

router.get('/muscularGroups', async (req, res) => await readItems(req, res, MuscularGroup));
router.post('/muscularGroups', async (req, res) => await createItem(req, res, MuscularGroup));

//Routines
router.get('/routines', async (req, res) => await readItems(req, res, Routines));
router.post('/routines', async (req, res) => await createItem(req, res, Routines));


module.exports = router;