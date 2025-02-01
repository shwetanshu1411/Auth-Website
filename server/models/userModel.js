import mongoose from "mongoose";

const userschema = new mongoose.Schema({
    name:{type:String , required:true},
    email:{type:String , required:true,unique:true},
    password:{type:String,required:true},
    verifyOtp:{type:Number,default:null},
    verifyOtpExpireAt:{type:Number,default:0},
    isAccountVerified:{type:Boolean,default:false},
    resetOtp:{type:Number,default:null},
    resetOtpExpireAt:{type:Number,default:0},
})
const userModel = mongoose.models.user||mongoose.model('user',userschema);

export default userModel;