const express = require("express");
const app = express();
const port = 2001;
const cors = require("cors");
const multer = require('multer');
const path = require("path");
const fs = require("fs");
const userRouter = require("./routers/userRouter");
const { Connection } = require("./database_connection/connect");
const userModel = require("./models/user");
app.use(express.json());
app.use(cors());
app.use(express.static("Uploads"));

app.use(express.urlencoded({ extended: false }));
Connection().then(() => { console.log("database connected!") }).catch((err) => {
    console.log("error occurred in connecting db", err);
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.put('/update-profile-image/:userId', upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.params.userId;
        const profileImage = req.file.path;
        const filename = req.file.filename;
        await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: { profileImage: filename } }
        );
        res.json({ path: filename });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).send('Internal server error.');
    }
});

app.get("/getProfileImage/:id",(req,res)=>{
    const ID=req.params.id;
    userModel.find({_id:ID}).then(resp=>{
        res.json(resp);
    })
    .catch(err=>res.json(err));
})

app.use("/user", userRouter);


app.listen(port, () => {
    console.log(`server is running at port: ${port}`);
})
