export interface Checklist {
  id: string;
  title: string;
  creator_id: string;
  group_id: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  checked: boolean;
  created_at: string;
}

export interface ChecklistDetail extends Checklist {
  items: ChecklistItem[];
}

export interface ChecklistCreate {
  title: string;
  group_id: string | null;
}
