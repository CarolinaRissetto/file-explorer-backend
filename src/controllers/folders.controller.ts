import { Request, Response } from "express";
import * as filesystemService from "../services/filesystem.service";

export async function getFolders(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.query.parentId as string | undefined;
    const all = req.query.all === "true";
    if (all) {
      const folders = await filesystemService.getAllFolders();
      res.json(folders);
      return;
    }
    const normalized =
      parentId === undefined || parentId === "" ? null : parentId;
    const folders = await filesystemService.getFolders(normalized);
    res.json(folders);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}

export async function createFolder(req: Request, res: Response): Promise<void> {
  try {
    const { name, parentId } = req.body as {
      name?: string;
      parentId?: string | null;
    };
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const normalizedParentId =
      parentId === undefined || parentId === "" ? null : parentId;
    const folder = await filesystemService.createFolder(name.trim(), normalizedParentId);
    res.status(201).json(folder);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("already exists")) {
      res.status(409).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
}

export async function patchFolder(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const { name } = req.body as { name?: string };
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const folder = await filesystemService.renameFolder(id, name.trim());
    res.json(folder);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "Folder not found") {
      res.status(404).json({ error: msg });
      return;
    }
    if (msg.includes("already exists")) {
      res.status(409).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
}

export async function deleteFolder(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    await filesystemService.deleteFolder(id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
