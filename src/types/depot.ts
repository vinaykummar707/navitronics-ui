export interface Depot {
  depotId: string;
  depotName: string;
  areaId: string;
  organizationId: string;
  active: boolean;
  deleted: boolean;
}

export interface CreateDepotDto {
  depotName: string;
  organizationId: string;
  areaId: string;
  active?: boolean;
  deleted?: boolean;
}

export interface UpdateDepotDto {
  depotId: string;
  depotName: string;
  organizationId: string;
  areaId: string;
  active?: boolean;
  deleted?: boolean;
}
