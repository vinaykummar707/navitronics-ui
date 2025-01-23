export interface Area {
  areaId?: string;
  areaName: string;
  organizationId: string;
  active: boolean;
  deleted: boolean;
  createdAt?: string;
  createdBy?: string;
}

export interface CreateAreaDto {
  areaName: string;
  organizationId: string;
}

export interface UpdateAreaDto {
  areaId: string;
  areaName: string;
  organizationId: string;
  active?: boolean;
  deleted?: boolean;
}
