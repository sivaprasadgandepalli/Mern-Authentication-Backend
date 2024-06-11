const userModel=require("../models/user");
const jwt=require("jsonwebtoken");
const bcrypt = require('bcrypt');
const secretKey="$!v@%2k01";

async function checkInputs(req,res,next){
    const body=req.body;
    const{email,password}=body;
    if(!body){
        return res.status(400).send("please provide all details")
    }
    const checkUser=await userModel.findOne({email:email});
    if(checkUser){
        return res.status(200).send("User already exists.")
    }
    next();
}

const verifyPassword = async (plaintextPassword, hashedPassword) => {
    try {
      const match = await bcrypt.compare(plaintextPassword, hashedPassword);
      return match;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  async function generateToken(req, res, next) {
    const body = req.body;
    if (!body) {
        return res.status(400).json({ error: "please provide credentials" });
    }
    const user = await userModel.findOne({ email: body.email });
    if (!user) {
        return res.status(404).json({ error: "User not found!" });
    }
    const passwordCheck = await verifyPassword(body.password, user.password);
    if (!passwordCheck) {
        return res.status(400).json({ error: "Password is wrong. Enter correctly" });
    }
    const payload = {
        email: user.email,
        password: user.password,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    };
    const accessToken = await jwt.sign(payload, secretKey);
    req.token = accessToken;
    req.userData=user;
    next();
}

module.exports={
    checkInputs,generateToken
}