export interface Tag {
  id?: string;
  workspaceId: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface CreateTagData {
  name: string;
  slug: string;
}
