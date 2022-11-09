/*------------------------------------------Import Modules:-------------------------------------------*/
const jwt = require('jsonwebtoken')
const authorModel = require('../models/authorModel')
const blogModel = require("../models/blogModel")
const mongoose = require("mongoose")

/*------------------------------------------AUTHENTICATION-------------------------------------------*/
const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key" || "X-Api-Key"]
        if (!token) {
            return res.status(401).send({ status: false, msg: "token is missing" })
        }
        jwt.verify(token, "Bikash Tripathy", function (error, decode) {
            if (error) {
                return res.status(401).send({ status: false, msg: "Authentication failed" });
            } else {
                req.token = decode;
                next();
            }
        })
    }
    catch (err) {
        return res.status(500).send({ status:false, msg: err.message })
    }
}

/*------------------------------------------AUTHORISATION-------------------------------------------*/
const authorisation = async (req, res, next) => {
    try {
        let blogId = req.params.blogId
        if (!blogId) {
            return res.status(400).send({ status: false, msg: "please enter blogId" })
        }
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return res.status(400).send({ status: false, msg: "please enter a valid blogId" })
        }
        let blog = await blogModel.findOne({_id: blogId, isDeleted: false})

        if (!blog) {
            return res.status(404).send({ status: false, msg: "No Blog found" })
        }
        let logUser = blog.authorId.toString()  // database authorId
        let userId = req.token.authorId  // decoded authorId

        console.log(logUser)
        console.log(userId)

        if (logUser != userId) {
            return res.status(403).send({ status: false, msg: "unauthorized person" })
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


/*------------------------------------------EXPORT-MODULES------------------------------------------*/
module.exports.authentication = authentication
module.exports.authorisation = authorisation

