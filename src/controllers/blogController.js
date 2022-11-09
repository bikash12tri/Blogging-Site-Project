/*------------------------------------------Import Modules:----------------------------------------*/
let blogModel = require('../models/blogModel')
let authorModel = require('../models/authorModel')
let jwt = require('jsonwebtoken')
let mongoose = require('mongoose');

/*------------------------------------------create blog:-------------------------------------------*/
const createBlog = async function (req, res) {
  try {
    let data = req.body
    let { title, body, authorId, category } = data

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please request data to be created" })
    }

    if (!title) {
      return res.status(400).send({ status: false, msg: "Title is required" })
    }

    if (!body) {
      return res.status(400).send({ status: false, msg: "Body is required" })
    }

    if (!authorId) {
      return res.status(400).send({ status: false, msg: 'please enter authorId' })
    }

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).send({ status: false, msg: 'please enter valid authorId' })
    }

    if (!category) {
      return res.status(400).send({ status: false, msg: "category is required" })
    }

    let savedData = await blogModel.create(data)
    return res.status(201).send({status:true, data: savedData })
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

/*------------------------------------------ Get blog:-------------------------------------------*/
const getBlogs = async (req, res) => {
  try {
    let data = req.query

    let blog = await blogModel.find({ $and: [{ isPublished: true, isDeleted: false }, data] })

    if (!blog[0]) {
      return res.status(404).send({ status: false, msg: 'Blog not found' })
    }

    return res.status(200).send({ status: true, data: blog })
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

/*------------------------------------------Update blog:-------------------------------------------*/
const updateBlog = async (req, res) => {
  try {
    let blogId = req.params.blogId
    let {title, body, tags, subcategory, isPublished} = req.body
    if (Object.keys(req.body)==0) {
      return res.status(400).send({ status: false, msg: "please enter data whatever you want to update" })
    }
    let obj = { 
      title: title,
      body: body,
      isPublished: isPublished, 
      $push: { tags: tags, subcategory : subcategory},
    }

    if (isPublished == true) {
      obj.publishedAt = Date.now()
    }
    let updatedData = await blogModel.findByIdAndUpdate( blogId, obj, { new: true })
    return res.status(200).send({ status: true, msg : "data updated successfully", data: updatedData})
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

/*------------------------------------------Delete by params:-------------------------------------------*/
const deleteBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId
    await blogModel.findByIdAndUpdate( blogId,{ isDeleted: true, deletedAt: Date.now() })
    return res.status(200).send({status: true, msg: "Blog deleted successfully"})
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

/*----------------------------------------Delete by query params:----------------------------------------*/
const deleteByQuery = async (req, res) => {
  try {
    let data = req.query
    let {category, authorId, tags, subcategory, isPublished} = data

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "please enter data"})
    }
    
    let findArr = [{category:category},{authorId:authorId},{tags:tags},{subcategory:subcategory},{isPublished:isPublished}]

    let deletedData = await blogModel.updateMany({ $and: [{ $or: findArr},{isDeleted: false}] },{isDeleted:true,deletedAt: Date.now()})
    if (deletedData.matchedCount == 0) {
      return res.status(404).send({status: false,msg:"No data found"})
    }
    return res.status(200).send({status: true, msg: "Data successfully deleted"})
  }
  catch (error) {
    return res.status(500).send({ status: false, msg: error.message })
  }
}

/*------------------------------------------Export Modules:------------------------------------------*/
module.exports = {createBlog, getBlogs, updateBlog, deleteBlog, deleteByQuery}
