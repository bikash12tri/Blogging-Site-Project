/*------------------------------------------Import Modules:-------------------------------------------*/
const authorModel = require("../models/authorModel")
const jwt = require('jsonwebtoken')
let validator = require('email-validator')
let passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9!@#$%^&*]{8,100})$/

/*------------------------------------------Create Author:-------------------------------------------*/
const createAuthor = async (req, res) => {
  try {
    let data = req.body
    let {fname, lname, title, email, password} = data

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please enter data in the request body" })
    }

    if (!fname) {
      return res.status(400).send({ status: false, msg: "firstname is required" })
    }

    if (!/^([a-zA-Z ]){1,100}$/.test(fname)) {
      return res.status(400).send({ status: false, msg: "please enter firstname in valid format" })
    }
    
    if (!lname) {
      return res.status(400).send({ status: false, msg: "lastname is required" })
    }

    if (!/^([a-zA-Z ]){1,100}$/.test(fname)) {
      return res.status(400).send({ status: false, msg: "please enter lastname in valid format" })
    }

    if (!title) {
      return res.status(400).send({ status: false, msg: "title is not present" })
    }

    if (["Mr", "Mrs", "Miss"].includes(title) == false) {
      return res.status(400).send({ status: false, msg: `title should be either "Mr" or "Mrs" or "Miss"` })
    }

    if (!password) {
      return res.status(400).send({ status: false, msg: "password is required" })
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).send({ status: false, msg: "password isn't validate, please make sure length is minimum 8, should have one uppercase and lowercase character and Number also and don't use space and have a special character" })
    }

    if (!email) {
      return res.status(400).send({ status: false, msg: "Email is required" })
    }

    if (!validator.validate(email)) {
      return res.status(400).send({ status: false, msg: "please enter valid email" })
    }

    let uniqueMail = await authorModel.findOne({ email: email })

    if (uniqueMail) {
      return res.status(409).send({ status: false, msg: "email already present...Try different email" })
    }

    let savedData = await authorModel.create(data)
    
    return res.status(201).send({ status: true, data: savedData })
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

/*------------------------------------------Login User:-------------------------------------------*/
const loginUser = async function (req, res) {
  try {

    let {email, password} = req.body

    if (Object.keys(req.body).length == 0) {
      return res.status(400).send({ status: false, msg: "email is required" })
    }

    if (!email) {
      return res.status(400).send({ status: false, msg: "email is required" })
    }

    if (!validator.validate(email)) {
      return res.status(400).send({ status: false, msg: "please enter valid email" })
    }

    if (!password) {
      return res.status(400).send({ status: false, msg: "password is required" })
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).send({ status: false, msg: "password isn't validate, please make sure length is minimum 8, should have one uppercase and lowercase character and Number also and don't use space and have a special character" })
    }
  
    let user = await authorModel.findOne({ email: email, password: password })
  
    if (!user) {
      return res.status(400).send({ status: false, msg: "email or password is incorrect" })
    }
  
    let token = jwt.sign({
        authorId: user._id.toString(),
        organisation: "FunctionUp",
      }, "Bikash Tripathy");
  
    res.setHeader("x-api-key", token);
    return res.status(201).send({ status: true, token: token })

  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message})
  }
}

/*------------------------------------------Export Modules:-------------------------------------------*/
module.exports.loginUser = loginUser
module.exports.createAuthor = createAuthor

