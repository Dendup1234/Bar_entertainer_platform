import express from "express";
import { getUploadSas } from "../controllers/upload.js";

const router = express.Router();

router.post("/sas", getUploadSas);

export default router;
