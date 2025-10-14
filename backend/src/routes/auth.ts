import { Router } from "express";
import {register,login,logout} from "../controllers/authController";
//middleware
import { auth } from "../middlewares/auth";

const router = Router();
router.post("/register",register);
router.post("/login",login);
router.post("/logout",auth,logout);


router.get("/me",auth,(req,res)=>{
    res.status(200).json({user:req.user});
});
export default router; 