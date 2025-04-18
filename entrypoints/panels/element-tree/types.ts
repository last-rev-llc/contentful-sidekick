export interface TreeNode {
  id: string;
  uuid: string;
  type: string;
  field?: string;
  displayText?: string;
  errors?: Error[] | null;
  children: TreeNode[];
}

export interface ContentfulNode {
  id: string;
}

export interface TreeNodeProps {
  node: TreeNode;
  level: number;
  parentPath?: ContentfulNode[];
}

export interface ContentfulEntry {
  id: string;
  contentType: string;
  locale: string;
  elementId?: string;
}

export interface TreeNodeActionsProps {
  contentfulUrl?: string;
  onEditClick: (event: React.MouseEvent) => void;
  disabled?: boolean;
}
