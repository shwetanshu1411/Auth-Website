import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const {token}=req.cookies;
    if(!token){
        return res.json({success:false,message:"Unauthorized"});
    }

    try{   
       const tokenDecode=jwt.verify(token,process.env.JWT_SECRET);
       if(tokenDecode){
           req.body.userId=tokenDecode.id;
           return next();
       }else{
           return res.json({success:false,message:"Unauthorized login again"});
       }
       next();

    }catch(error){
        return res.json({success:false,message:error.message});
    }
}

export default userAuth;