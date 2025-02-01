import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';



const app = express();
const port=process.env.PORT || 4000;
connectDB();

const  allowedOrigins = ['http://localhost:5173'];

const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // If you need to handle cookies or authentication
  };

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

//API END POINTS
app.get('/',(req,res)=>{
    res.send('API WORKING FINE');
});
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);

app.listen(port,()=>console.log(`server started on port ${port}`));
