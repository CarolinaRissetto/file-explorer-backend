import { Request, Response } from "express";
import * as filesystemService from "../services/filesystem.service";

export async function getFiles(req: Request, res: Response): Promise<void> {
  try {
    const parentId = req.query.parentId as string | undefined;
    const all = req.query.all === "true";
    if (all) {
      const files = await filesystemService.getAllFiles();
      res.json(files);
      return;
    }
    const normalized =
      parentId === undefined || parentId === "" ? "__root__" : parentId;
    const files = await filesystemService.getFiles(normalized);
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}

export async function createFile(req: Request, res: Response): Promise<void> {
  try {
    const { name, parentId, size } = req.body as {
      name?: string;
      parentId?: string;
      size?: number;
    };
    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (typeof parentId !== "string" || !parentId) {
      res.status(400).json({ error: "parentId is required" });
      return;
    }
    const numSize = typeof size === "number" ? size : Number(size);
    if (Number.isNaN(numSize) || numSize < 0) {
      res.status(400).json({ error: "size must be a non-negative number" });
      return;
    }
    const file = await filesystemService.createFile(name.trim(), parentId, numSize);
    res.status(201).json(file);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("already exists")) {
      res.status(409).json({ error: msg });
      return;
    }
    res.status(500).json({ error: msg });
  }
}

export async function patchFile(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const { name, parentId } = req.body as { name?: string; parentId?: string };
    const patch: { name?: string; parentId?: string } = {};
    if (typeof name === "string" && name.trim()) patch.name = name.trim();
    if (typeof parentId === "string") patch.parentId = parentId;
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "name or parentId required" });
      return;
    }
    const file = await filesystemService.updateFile(id, patch);
    res.json(file);
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "File not found") {
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

export async function reorderFiles(req: Request, res: Response): Promise<void> {
  try {
    const { parentId, orderedIds } = req.body as {
      parentId?: string | null;
      orderedIds?: string[];
    };
    const normalizedParentId =
      parentId === undefined || parentId === null || parentId === ""
        ? "__root__"
        : parentId;
    if (!Array.isArray(orderedIds)) {
      res.status(400).json({ error: "orderedIds must be an array" });
      return;
    }
    await filesystemService.reorderFiles(normalizedParentId, orderedIds);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}

export async function deleteFile(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    await filesystemService.deleteFile(id);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
