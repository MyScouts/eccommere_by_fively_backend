const UserModel = require("../models/user_model")
let ProuductModel = require('../models/product_model')
let path = require('path');
const { sendMail } = require("../helpers/node_mailter");
const mail_thread = require("../threads/mail_thread");
const { generateVerifiedCode } = require("../helpers/auth_helper");
const paginateHelper = require("../helpers/paginate_helper");
const mongoose = require('mongoose')
var NumberInt = require('mongoose-int32');


let addFavorites = async (req, res, next) => {
    let productId = req.body.productId
    let product = await ProuductModel.findOne({ _id: productId })

    if (product) {
        let user = await UserModel.findOne(req.user._id)
        let index = user.favorites.indexOf(productId)
        if (index >= 0) {
            user.favorites.splice(index, 1);
        } else {
            user.favorites.push(productId)
        }
        await user.save()
        res.status(200).json({
            status: 200,
            success: true,
            message: "",
            data: null
        })

    } else {
        res.status(400).json({
            status: 400,
            success: true,
            message: "",
            data: null
        })
    }
}

// 
let profile = async (req, res, next) => {

    let userInfo = await UserModel.aggregate([

        {
            $project: {
                // carts: { $size: "$carts" },
                favorites: { $size: "$favorites" },
                payments: { $size: "$payments" },
                address: { $size: "$address" },
                reviews: { $size: "$reviews" },
                orders: 1,
                firstName: 1,
                lastName: 1,
                phoneNumber: 1,
                email: 1,
                avatar: 1,
                emailVerified: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$emailVerified" } },
                phoneVerified: 1,
            }
        },
        {
            $match: {
                _id: req.user._id
            }
        },
        { $limit: 1 },
        {
            $lookup: {
                "from": "carts",
                "localField": "_id",
                "foreignField": "userId",
                "as": "myCarts"
            }
        },
        {
            $lookup: {
                "from": "orders",
                "localField": "_id",
                "foreignField": "userId",
                "as": "myOrders"
            }
        },
        {
            $addFields: {
                carts: { $size: "$myCarts" },
                orders: { $size: "$myOrders" }
            }
        },
        {
            $project: {
                myCarts: 0,
                myOrders: 0,
            }
        },
    ])

    // let verifiedCode = generateVerifiedCode()
    // let data = {
    //     to: "fxhuytran99@gmail.com",
    //     subject: "Verified Account",
    //     templateVars: {
    //         verifiedCode: verifiedCode
    //     }
    // }
    // console.log("🚀 ~ file: user_controller.js ~ line 73 ~ profile ~ data", data)
    // // await sendMail({ template: "template1", ...data });

    // await mail_thread({ template: "template1", ...data })

    return res.status(200).json({
        status: 200,
        success: true,
        message: "",
        data: userInfo[0]
    })
}

// 
let updateProfile = async (req, res, next) => {
    let { firstName, lastName, phoneNumber } = req.body
    let avatar = path.normalize(req.file.path).split("\\").slice(1).join("/")
    await UserModel.findByIdAndUpdate(req.user._id, { firstName, lastName, phoneNumber, avatar })
    let user = await UserModel.findById(req.user._id, { password: 0, __v: 0 })

    res.status(200).json({
        status: 200,
        success: true,
        message: "",
        data: user
    })
}

// 
let myFavorites = async (req, res) => {
    let user = await UserModel.findOne(req.user._id).populate('favorites')
    res.status(200).json({
        status: 200,
        success: true,
        message: "",
        data: user.favorites
    })
}

let getAllUsers = async (req, res) => {
    condiction = {}
    if (req.query.search && req.query.search !== "undefined") {
        condiction.productName = { $regex: new RegExp(req.query.search, 'i') }
    }

    let users = await UserModel.aggregate(
        [
            {
                $match: {
                    logical_delete: { $exists: true }
                }
            },
            // {
            //     $facet: {

            //         metadata: [{ $count: "total" }, { $addFields: { page: 1 } }],
            //         data: [{ $skip: 1 }, { $limit: 10 }] //- add projection here wish you re-shape the docs
            //     }
            // }
        ]
    )

    res.status(200).json({
        status: 200,
        success: true,
        message: "",
        data: users
    })
}
module.exports = {
    profile,
    updateProfile,
    addFavorites,
    myFavorites,
    getAllUsers
}