import type { File } from "../models/File";
import type { Folder } from "../models/Folder";
import { prisma } from "../lib/prisma";

function toFolder(row: { id: string; name: string; parentId: string | null; createdAt: Date }): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    createdAt: row.createdAt.toISOString(),
  };
}

function toFile(row: { id: string; name: string; parentId: string; size: number; order: number; createdAt: Date }): File {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    size: row.size,
    order: row.order,
    createdAt: row.createdAt.toISOString(),
  };
}

function sameNameCaseInsensitive(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

async function collectDescendantFolderIds(parentId: string): Promise<string[]> {
  const children = await prisma.folder.findMany({ where: { parentId } });
  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids.push(...(await collectDescendantFolderIds(child.id)));
  }
  return ids;
}

export async function getFolders(parentId: string | null | undefined): Promise<Folder[]> {
  const rows = await prisma.folder.findMany({
    where: { parentId: parentId ?? null },
  });
  return rows.map(toFolder);
}

export async function getAllFolders(): Promise<Folder[]> {
  const rows = await prisma.folder.findMany();
  return rows.map(toFolder);
}

export async function createFolder(name: string, parentId: string | null): Promise<Folder> {
  const siblingFolders = await prisma.folder.findMany({
    where: { parentId: parentId ?? null },
  });
  if (siblingFolders.some((f) => sameNameCaseInsensitive(f.name, name))) {
    throw new Error(`Folder "${name}" already exists in this directory`);
  }

  const fileParentId = parentId === null ? "__root__" : parentId;
  const siblingFiles = await prisma.file.findMany({
    where: { parentId: fileParentId },
  });
  if (siblingFiles.some((f) => sameNameCaseInsensitive(f.name, name))) {
    throw new Error(`A file named "${name}" already exists in this directory`);
  }

  const folder = await prisma.folder.create({
    data: { name, parentId },
  });
  return toFolder(folder);
}

export async function renameFolder(id: string, newName: string): Promise<Folder> {
  const folder = await prisma.folder.findUnique({ where: { id } });
  if (!folder) throw new Error("Folder not found");

  const siblingFolders = await prisma.folder.findMany({
    where: { parentId: folder.parentId },
  });
  if (siblingFolders.some((f) => f.id !== id && sameNameCaseInsensitive(f.name, newName))) {
    throw new Error(`Folder "${newName}" already exists in this directory`);
  }

  const fileParentId = folder.parentId === null ? "__root__" : folder.parentId;
  const siblingFiles = await prisma.file.findMany({
    where: { parentId: fileParentId },
  });
  if (siblingFiles.some((f) => sameNameCaseInsensitive(f.name, newName))) {
    throw new Error(`A file named "${newName}" already exists in this directory`);
  }

  const updated = await prisma.folder.update({
    where: { id },
    data: { name: newName },
  });
  return toFolder(updated);
}

export async function deleteFolder(id: string): Promise<void> {
  const idsToDelete = await collectDescendantFolderIds(id);
  idsToDelete.push(id);

  await prisma.file.deleteMany({
    where: { parentId: { in: idsToDelete } },
  });

  await prisma.folder.deleteMany({
    where: { id: { in: idsToDelete } },
  });
}

export async function getFiles(parentId: string | null | undefined): Promise<File[]> {
  const pid = parentId === undefined || parentId === null ? "__root__" : parentId;
  const rows = await prisma.file.findMany({
    where: { parentId: pid },
    orderBy: { order: "asc" },
  });
  return rows.map(toFile);
}

export async function getAllFiles(): Promise<File[]> {
  const rows = await prisma.file.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
  });
  return rows.map(toFile);
}

export async function createFile(name: string, parentId: string, size: number): Promise<File> {
  const siblingFiles = await prisma.file.findMany({
    where: { parentId },
  });
  if (siblingFiles.some((f) => sameNameCaseInsensitive(f.name, name))) {
    throw new Error(`File "${name}" already exists in this directory`);
  }

  const foldersInSameDir = await prisma.folder.findMany({
    where: parentId === "__root__" ? { parentId: null } : { parentId },
  });
  if (foldersInSameDir.some((f) => sameNameCaseInsensitive(f.name, name))) {
    throw new Error(`A folder named "${name}" already exists in this directory`);
  }

  const maxOrder = siblingFiles.reduce((max, f) => Math.max(max, f.order), -1);

  const file = await prisma.file.create({
    data: { name, parentId, size, order: maxOrder + 1 },
  });
  return toFile(file);
}

export async function updateFile(
  id: string,
  patch: { name?: string; parentId?: string; order?: number }
): Promise<File> {
  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) throw new Error("File not found");

  const updates: { name?: string; parentId?: string; order?: number } = {};

  if (patch.name !== undefined) {
    const siblingFiles = await prisma.file.findMany({
      where: { parentId: file.parentId },
    });
    if (siblingFiles.some((f) => f.id !== id && sameNameCaseInsensitive(f.name, patch.name!))) {
      throw new Error(`File "${patch.name}" already exists in this directory`);
    }
    const folderParentId = file.parentId === "__root__" ? null : file.parentId;
    const siblingFolders = await prisma.folder.findMany({
      where: { parentId: folderParentId },
    });
    if (siblingFolders.some((f) => sameNameCaseInsensitive(f.name, patch.name!))) {
      throw new Error(`A folder named "${patch.name}" already exists in this directory`);
    }
    updates.name = patch.name;
  }

  if (patch.parentId !== undefined) {
    const siblingFiles = await prisma.file.findMany({
      where: { parentId: patch.parentId },
    });
    if (siblingFiles.some((f) => f.id !== id && sameNameCaseInsensitive(f.name, file.name))) {
      throw new Error(`File "${file.name}" already exists in target folder`);
    }
    const maxOrder = siblingFiles.reduce((max, f) => Math.max(max, f.order), -1);
    updates.parentId = patch.parentId;
    updates.order = maxOrder + 1;
  }

  if (patch.order !== undefined) {
    updates.order = patch.order;
  }

  if (Object.keys(updates).length === 0) {
    return toFile(file);
  }

  const updated = await prisma.file.update({
    where: { id },
    data: updates,
  });
  return toFile(updated);
}

export async function reorderFiles(parentId: string, orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.file.updateMany({
      where: { id: orderedIds[i], parentId },
      data: { order: i },
    });
  }
}

export async function deleteFile(id: string): Promise<void> {
  await prisma.file.delete({
    where: { id },
  });
}
