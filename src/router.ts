import { Router } from "express";
import { getLenovoLaptops } from "./controllers/laptopController";

const router = Router();
export default router.get("/laptops", getLenovoLaptops);
