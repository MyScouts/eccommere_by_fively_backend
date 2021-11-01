const { PAGE_SIZE } = require("../configs/app_config")

let paginateHelper = async (req, model, condiction = {}, populate = [], sort = []) => {
    let page = parseInt(req.query.page)
    let limit = parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : PAGE_SIZE

    let startIndex = page  * limit
    // let endIndex = page * limit
    totalItem = await model.countDocuments(condiction);
    let totalPage = Math.ceil((totalItem) / limit) - 1;
    
    if (page > 0 && limit > 0) {
        items = await model
        .find(condiction)
        .select(['-__v', '-logical_delete'])
        .sort(sort)
        .populate(populate)
        .skip(startIndex)
        .limit(limit)

        if (items.length <= 0) return false;
        result = {
            totalItems:totalItem, 
            totalPage: totalPage,
            page: page,
            pageSize: limit,
            items: items
        }
    } else {
        result = {
            data: await model.find({})
        }
    }

    return result
}
module.exports = paginateHelper