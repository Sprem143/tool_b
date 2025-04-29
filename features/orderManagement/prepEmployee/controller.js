const Employee2 = require('./model')
const bcryptjs = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const security_key = process.env.SECURITY_KEY;
const emailpassword = process.env.EMAIL_PASSWORD


exports.signup = async (req, res) => {
    const { formData } = req.body;
console.log(formData.name)
    try {
        const hashpassword = await bcryptjs.hash(formData.password, 10);
        let employee = new Employee2({
            name: formData.name,
            mobile: formData.mobile,
            email: formData.email,
            addedby:formData.addedby,
            password: hashpassword
        });

        await employee.save();

        // Send Welcome Email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your SMTP service
            auth: {
                user: "rcube.prem@gmail.com",          // Replace with your Gmail
                pass: "kwwl defk kohk ksms",
            }
        });

        const mailOptions = {
            from: '"Gster E-Solution Pvt Ltd" <yourcompanyemail@example.com>',
            to: formData.email,
            subject: 'Welcome to Gster E-Solution Pvt Ltd',
            html: getWelcomeEmailTemplate(formData.name, formData.email, formData.password)
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ status: true });

    } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, msg: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, loginType } = req.body;
        console.log(email, password, loginType)
        if (loginType == 'employee') {
            let user = await Employee2.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ status: false, msg: "User not found" })
            }
            if (await bcryptjs.compare(password, user.password)) {
                const token = jwt.sign({ email: user.email }, security_key, { expiresIn: "24h" })
                res.status(200).json({ status: true, token: token })
            } else {
                res.json({ status: false, msg: "Wrong password" })
            }
        }
    } catch (err) {
        console.log(err)
    }
}

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email)
    if (!email) {
      return res.status(400).json({ status: false, msg: "Email is required" });
    }
    let isexist = await Employee2.findOne({ email: email });
    if (isexist?.email == email) {
      return res.status(409).json({ status: false, msg: 'Email already exist' })
    }

    const otp = generateOTP();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rcube.prem@gmail.com",          // Replace with your Gmail
        pass: emailpassword,             // Use App Password
      },
    });

    const mailOptions = {
      from: '"Gstar E-solution Pvt Ltd" <your-email@gmail.com>',
      to: email,
      subject: "Your OTP for Employee Sign Up - Gstar E-solution Pvt Ltd",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="text-align: center; color: #0d6efd;">Gstar E-solution Pvt Ltd</h2>
          <p>Hello,</p>
          <p>Thank you for choosing Gstar E-solution Pvt Ltd. Please use the following One-Time Password (OTP) to complete your employee sign-up process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #0d6efd;">${otp}</span>
          </div>
          <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone for security reasons.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p>Regards,<br><strong>Gstar E-solution Pvt Ltd Team</strong></p>
          <hr style="margin-top: 30px;">
          <p style="font-size: 12px; color: gray; text-align: center;">Securing your data, empowering your business.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ status: true, otp: otp }); // You may remove otp from response in production
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ status: false, msg: "Failed to send OTP" });
  }
};
exports.getprofile = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ msg: "Authorization header missing" });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: false, msg: "Token missing from authorization header" });
        }
        let employee;
        try {
            employee = jwt.verify(token, security_key);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: false, msg: "Session expired" });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({ status: false, msg: "Invalid token, Please relogin" });
            }
            throw err;
        }
        let user = await Employee2.findOne({ email: employee.email });
        if (!user) {
            return res.status(404).json({ status: false, msg: "Admin not found" });
        }
        user = user.toObject()
        delete user.password;
        return res.status(200).json({ status: true, employee: user });

    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ msg: "An unexpected error occurred", error: err.message });
    }
};
function getWelcomeEmailTemplate(name, email, password) {
    return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; overflow:hidden;">
      <div style="background-color:#004aad; padding:20px; color:white; text-align:center;">
        <h1>Welcome to Gster E-Solution Pvt Ltd</h1>
      </div>
      <div style="padding:20px;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>We are excited to welcome you to <strong>Gster E-Solution Pvt Ltd</strong> as a Order Management Employee!</p>
        <p>Here are your login details:</p>
        <table style="width:100%; margin:20px 0;">
          <tr>
            <td style="padding:8px; background:#f4f4f4; font-weight:bold;">Username (Email):</td>
            <td style="padding:8px;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px; background:#f4f4f4; font-weight:bold;">Password:</td>
            <td style="padding:8px;">${password}</td>
          </tr>
        </table>
        <p>Please keep this information safe and do not share it with anyone.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best Regards,<br><strong>Team Gster</strong></p>
      </div>
      <div style="background-color:#f0f0f0; padding:10px; text-align:center; font-size:12px; color:#777;">
        © ${new Date().getFullYear()} Gster E-Solution Pvt Ltd. All rights reserved.
      </div>
    </div>
    `;
  }

// exports.= async(req, res)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         res.status(500).json({status:false, msg:err})
//     }
// }

// exports.= async(req, res)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         res.status(500).json({status:false, msg:err})
//     }
// }

// exports.= async(req, res)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         res.status(500).json({status:false, msg:err})
//     }
// }

// exports.= async(req, res)=>{
//     try{

//     }catch(err){
//         console.log(err);
//         res.status(500).json({status:false, msg:err})
//     }
// }