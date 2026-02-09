import { Router } from "express";
import * as foldersController from "../controllers/folders.controller";

const router = Router();

router.get("/", foldersController.getFolders);
router.post("/", foldersController.createFolder);
router.patch("/:id", foldersController.patchFolder);
router.delete("/:id", foldersController.deleteFolder);

export default router;
