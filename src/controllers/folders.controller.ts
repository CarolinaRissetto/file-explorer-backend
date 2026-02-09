import { Request, Response } from "express";
import * as filesystemService from "../services/filesystem.service";

export function getFolders(req: Request, res: Response): void {
  try {
    const parentId = req.query.parentId as string | undefined;
    const all = req.query.all === "true";
    if (all) {
      const folders = filesystemService.getAllFolders();
      res.json(folders);
      return;
    }
    const normalized =
      parentId === undefined || parentId === "" ? null : parentId;
    const folders = filesystemService.getFolders(normalized);
    res.json(folders);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}

export function createFolder(req: Request, res: Response): void {
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
    const folder = filesystemService.createFolder(name.trim(), normalizedParentId);
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

export function patchFolder(req: Request, res: Response): void {
  try {
    const id = req.params.id;
    const { name } = req.body as { name?: string };
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const folder = filesystemService.renameFolder(id, name.trim());
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

export function deleteFolder(req: Request, res: Response): void {
  try {
    const id = req.params.id;
    filesystemService.deleteFolder(id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
