// index.js
const User = require('../models/user.model');

// Sample code for usage
function collectData(req, res) {
   const { name, email, mobile, password } = req.body
   let user = new User({ name, email, mobile, password });
   // Your code below

}