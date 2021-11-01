let router = require('express-promise-router')()
const multer = require('multer')
let productController = require('../controllers/product_controller')
const { imageFilter } = require('../helpers/image_filter')
const storage = require('../middlewares/upload_file')
router.route("")
    .get(productController.products)
    .post(multer({ storage: storage, fileFilter: imageFilter }).any(['product_avatar', 'product_background']), productController.createProduct)

router.route("/:productId")
    .get(productController.product)

router.route("/:productId/attributes")
    .get(productController.productAtributes)
module.exports = router