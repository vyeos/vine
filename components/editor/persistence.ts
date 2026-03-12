export type ProseMirrorJSON = {
  type: string;
  content?: ProseMirrorJSON[];
  [key: string]: unknown;
};
