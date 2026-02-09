import { Router } from "express";
import * as filesController from "../controllers/files.controller";

const router = Router();

router.get("/", filesController.getFiles);
router.post("/", filesController.createFile);
router.patch("/reorder", filesController.reorderFiles);
router.patch("/:id", filesController.patchFile);
router.delete("/:id", filesController.deleteFile);

export default router;
