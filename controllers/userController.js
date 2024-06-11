const userModel = require("../models/user");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'varagandepalli@gmail.com',
    pass: 'oylenuywxzwbpcnu'
  }
});

async function handleUserRegister(req, res) {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    await userModel.create({ name, email, password: hashedPassword });
    const mailOptions = {
      from: 'varagandepalli@gmail.com',
      to: email,
      subject: 'Welcome to SecureAuth Service. your Acoount is successfully created.',
      html: `
        <p>Dear ${name}, </p>
        <h3>Welcome to SecureAuth!</h3>
        <p>We are thrilled to have you on the board. Your account has been successfully craeted. You are now a part of our community dedicated to secure authentication</
        p>
        <p>Please verify your email by clicking on the button.</p>
        <a href="http://localhost:3000/" style="color:blue;">Verify your email</a>
        <p><strong>Here are your account details:</strong></p>
        <ul>
        <li><strong>User Name:</strong>${name}</li>
        <li><strong>Email:</strong>${email}</li>
        </ul>
        <p>Best regards:</p>
        <p>The SecureAuth team.</p>

      `
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      else console.log('email sent' + info.response);
    })
    return res.status(201).json({ message: "User account created successfully!" });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const data = password;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(data, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function handleUserLogin(req, res) {
  const token = req.token;
  const userData = req.userData;
  return res.status(200).json({ token, message: "Logged in successfully!", user: userData });
}

async function handleUserDelete(req, res) {
  if (!req.params.id) {
    return res.send("Id is required to delete user");
  }
  const resp = await userModel.deleteOne({ _id: req.params.id });
  if (!resp) {
    return res.send("Failed to delete account.")
  }
  return res.send("Account deleted successfully");
}

async function handleUpdateProfile(req, res) {
  const { id, name, email, password } = req.body;
  const newpassword = await hashPassword(password);

  console.log(newpassword);
  try {
    await userModel.findOneAndUpdate(
      { _id: id },
      { $set: { name: name, email: email, password: newpassword } },
      { new: true }
    );
    console.log('updated profile');
    res.status(200).json({ _id: id, name: name, email: email, password: password });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Internal server error.');
  }
}

async function handleChangePassword(req, res) {
  try {
    const { password, email } = req.body;
    const newpassword = await hashPassword(password);
    await userModel.findOneAndUpdate({ email:email }, { $set: { password: newpassword } },{ new: true })
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: error })
  }
}

async function handleVerifyUser(req, res) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email });
    if(!user){
      return res.status(404).json({message:"user not found"})
    }
    const Otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    const mailOptions = {
      from: 'varagandepalli@gmail.com',
      to: email,
      subject: ' SecureAuth OTP: Access Code for Account Verification.',
      html: `
        <p>Dear user, </p>
        <h3>Here is your one time password(OTP)</h3>
        <p><strong>OTP:</strong>${Otp}</p>
        <p>Best regards:</p>
        <p>The SecureAuth team.</p>
      `
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      else console.log('email sent' + info.response);
    })
    
    return res.status(200).json({message:"Verification completed.An Otp sent",OTP:Otp,expires:expiryTime})
  } catch (error) {
    return res.status(500).send("internal error fetching user");
  }
}
module.exports = {
  handleUserRegister,
  handleUserLogin,
  handleUserDelete,
  handleUpdateProfile,
  handleChangePassword,
  handleVerifyUser
};
