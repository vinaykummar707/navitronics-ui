export interface Organization {
  organizationId: string;
  organizationName: string;
  emailId: string;
  phoneNumber: string;
  contactPerson: string;
  active: boolean;
  deleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationDto {
  organizationName: string;
  emailId: string;
  phoneNumber: string;
  contactPerson: string;
}

export interface UpdateOrganizationDto {
  organizationId:string;
  organizationName: string;
  emailId: string;
  phoneNumber: string;
  contactPerson: string;
  active?: boolean;
  deleted?: boolean;
}
