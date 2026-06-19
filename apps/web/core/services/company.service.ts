import { API_BASE_URL } from "@plane/constants";
import type { IWorkspace } from "@plane/types";
import { APIService } from "@/services/api.service";

export type TCompany = {
  id: string;
  name: string;
  slug: string;
  description: string;
  owner: string;
  owner_detail?: {
    id: string;
    first_name: string;
    last_name: string;
    display_name: string;
    email: string;
    avatar_url?: string;
  } | null;
  workspace_count: number;
  member_count: number;
  role: number;
  created_at: string;
  updated_at: string;
};

export type TCompanyCreatePayload = {
  name: string;
  slug?: string;
  description?: string;
};

export class CompanyService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async list(): Promise<TCompany[]> {
    return this.get("/api/companies/")
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async create(payload: TCompanyCreatePayload): Promise<TCompany> {
    return this.post("/api/companies/", payload)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async retrieve(slug: string): Promise<TCompany> {
    return this.get(`/api/companies/${slug}/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async update(slug: string, payload: Partial<TCompanyCreatePayload>): Promise<TCompany> {
    return this.patch(`/api/companies/${slug}/`, payload)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async workspaces(slug: string): Promise<IWorkspace[]> {
    return this.get(`/api/companies/${slug}/workspaces/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}

const companyService = new CompanyService();
export default companyService;
