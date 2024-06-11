const mongoose = require("mongoose");

async function Connection() {
    return await mongoose.connect("mongodb+srv://20mh1a0483:M9ihCjcIVE06t4Uk@cluster0.fspwj9t.mongodb.net/Authentication");
}

module.exports = { Connection };
