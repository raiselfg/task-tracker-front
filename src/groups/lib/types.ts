export interface Group {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Invitation {
  group_id: string;
  token: string;
  created_at: string;
}

export interface InvitationPreview {
  group_id: string;
  name: string;
}
