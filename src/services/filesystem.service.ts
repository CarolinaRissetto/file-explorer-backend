import type { File } from "../models/File";
import type { Folder } from "../models/Folder";

const folders: Folder[] = [];
const files: File[] = [];

let folderIdCounter = 1;
let fileIdCounter = 1;

function nextFolderId(): string {
  return String(folderIdCounter++);
}

function nextFileId(): string {
  return String(fileIdCounter++);
}

function findFolderById(id: string): Folder | undefined {
  return folders.find((f) => f.id === id);
}

function findFileById(id: string): File | undefined {
  return files.find((f) => f.id === id);
}

function collectDescendantFolderIds(parentId: string): string[] {
  const children = folders.filter((f) => f.parentId === parentId);
  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    ids.push(...collectDescendantFolderIds(child.id));
  }
  return ids;
}

export function getFolders(parentId: string | null | undefined): Folder[] {
  return folders.filter((f) => f.parentId === parentId);
}

export function getAllFolders(): Folder[] {
  return [...folders];
}

export function createFolder(name: string, parentId: string | null): Folder {
  const exists = folders.some(
    (f) =>
      f.parentId === parentId &&
      f.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    throw new Error(`Folder "${name}" already exists in this directory`);
  }

  const fileParentId = parentId === null ? "__root__" : parentId;
  const fileExists = files.some(
    (f) =>
      f.parentId === fileParentId &&
      f.name.toLowerCase() === name.toLowerCase()
  );
  if (fileExists) {
    throw new Error(`A file named "${name}" already exists in this directory`);
  }

  const folder: Folder = {
    id: nextFolderId(),
    name,
    parentId,
    createdAt: new Date().toISOString(),
  };
  folders.push(folder);
  return folder;
}

export function renameFolder(id: string, newName: string): Folder {
  const folder = findFolderById(id);
  if (!folder) throw new Error("Folder not found");

  const exists = folders.some(
    (f) =>
      f.parentId === folder.parentId &&
      f.name.toLowerCase() === newName.toLowerCase() &&
      f.id !== id
  );
  if (exists) {
    throw new Error(`Folder "${newName}" already exists in this directory`);
  }

  const fileParentId = folder.parentId === null ? "__root__" : folder.parentId;
  const fileExists = files.some(
    (f) =>
      f.parentId === fileParentId &&
      f.name.toLowerCase() === newName.toLowerCase()
  );
  if (fileExists) {
    throw new Error(`A file named "${newName}" already exists in this directory`);
  }

  folder.name = newName;
  return { ...folder };
}

export function deleteFolder(id: string): void {
  const idsToDelete = collectDescendantFolderIds(id);
  idsToDelete.push(id);

  for (let i = files.length - 1; i >= 0; i--) {
    if (idsToDelete.includes(files[i].parentId)) {
      files.splice(i, 1);
    }
  }

  for (let i = folders.length - 1; i >= 0; i--) {
    if (idsToDelete.includes(folders[i].id)) {
      folders.splice(i, 1);
    }
  }
}

export function getFiles(parentId: string | null | undefined): File[] {
  const pid = parentId === undefined || parentId === null ? "__root__" : parentId;
  return files
    .filter((f) => f.parentId === pid)
    .sort((a, b) => a.order - b.order);
}

export function getAllFiles(): File[] {
  return [...files];
}

export function createFile(name: string, parentId: string, size: number): File {
  const exists = files.some(
    (f) =>
      f.parentId === parentId && f.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    throw new Error(`File "${name}" already exists in this directory`);
  }

  const siblingFolderNames = folders.filter(
    (f) => f.parentId === parentId || (parentId === "__root__" && f.parentId === null)
  );
  const folderExists = siblingFolderNames.some(
    (f) => f.name.toLowerCase() === name.toLowerCase()
  );
  if (folderExists) {
    throw new Error(`A folder named "${name}" already exists in this directory`);
  }

  const siblingFiles = files.filter((f) => f.parentId === parentId);
  const maxOrder = siblingFiles.reduce((max, f) => Math.max(max, f.order), -1);

  const file: File = {
    id: nextFileId(),
    name,
    parentId,
    size,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };
  files.push(file);
  return file;
}

export function updateFile(
  id: string,
  patch: { name?: string; parentId?: string; order?: number }
): File {
  const file = findFileById(id);
  if (!file) throw new Error("File not found");

  if (patch.name !== undefined) {
    const exists = files.some(
      (f) =>
        f.parentId === file.parentId &&
        f.name.toLowerCase() === patch.name!.toLowerCase() &&
        f.id !== id
    );
    if (exists) {
      throw new Error(`File "${patch.name}" already exists in this directory`);
    }
    const folderParentId = file.parentId === "__root__" ? null : file.parentId;
    const folderExists = folders.some(
      (f) =>
        f.parentId === folderParentId &&
        f.name.toLowerCase() === patch.name!.toLowerCase()
    );
    if (folderExists) {
      throw new Error(
        `A folder named "${patch.name}" already exists in this directory`
      );
    }
    file.name = patch.name;
  }

  if (patch.parentId !== undefined) {
    const exists = files.some(
      (f) =>
        f.parentId === patch.parentId &&
        f.name.toLowerCase() === file.name.toLowerCase() &&
        f.id !== id
    );
    if (exists) {
      throw new Error(`File "${file.name}" already exists in target folder`);
    }
    const siblingFiles = files.filter((f) => f.parentId === patch.parentId);
    const maxOrder = siblingFiles.reduce(
      (max, f) => Math.max(max, f.order),
      -1
    );
    file.parentId = patch.parentId;
    file.order = maxOrder + 1;
  }

  if (patch.order !== undefined) {
    file.order = patch.order;
  }

  return { ...file };
}

export function reorderFiles(parentId: string, orderedIds: string[]): void {
  orderedIds.forEach((id, index) => {
    const file = files.find((f) => f.id === id && f.parentId === parentId);
    if (file) file.order = index;
  });
}

export function deleteFile(id: string): void {
  const idx = files.findIndex((f) => f.id === id);
  if (idx !== -1) files.splice(idx, 1);
}
