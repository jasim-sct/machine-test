import { api } from './api';
import {
  CreateFormDto,
  CreateVersionDto,
  FormDataViewDto,
  FormDto,
  FormVersionDto,
  PublicFormDto,
  UpdateDraftDto,
  UpdateVersionDto,
} from '@saas/shared';

export const formsService = {
  create: async (dto: CreateFormDto): Promise<FormDto> => {
    return api.post<FormDto>('/forms', dto);
  },

  getAll: async (): Promise<FormDto[]> => {
    return api.get<FormDto[]>('/forms');
  },

  getOne: async (id: string): Promise<FormDto> => {
    return api.get<FormDto>(`/forms/${id}`);
  },

  updateDraft: async (id: string, dto: UpdateDraftDto): Promise<FormDto> => {
    return api.patch<FormDto>(`/forms/${id}/draft`, dto);
  },

  deploy: async (id: string): Promise<FormDto> => {
    return api.post<FormDto>(`/forms/${id}/deploy`);
  },

  createVersion: async (id: string, dto?: CreateVersionDto): Promise<FormVersionDto> => {
    return api.post<FormVersionDto>(`/forms/${id}/versions`, dto || {});
  },

  updateVersion: async (
    id: string,
    versionId: string,
    dto: UpdateVersionDto,
  ): Promise<FormVersionDto> => {
    return api.patch<FormVersionDto>(`/forms/${id}/versions/${versionId}`, dto);
  },

  deployVersion: async (id: string, versionId?: string): Promise<FormDto> => {
    if (versionId) {
      return api.post<FormDto>(`/forms/${id}/versions/${versionId}/deploy`);
    }
    return api.post<FormDto>(`/forms/${id}/deploy`);
  },

  duplicateVersion: async (id: string, versionId: string): Promise<FormVersionDto> => {
    return api.post<FormVersionDto>(`/forms/${id}/versions/${versionId}/duplicate`);
  },

  updateSettings: async (
    id: string,
    dto: { name?: string; settings?: any },
  ): Promise<FormDto> => {
    return api.patch<FormDto>(`/forms/${id}/settings`, dto);
  },

  getDataView: async (id: string): Promise<FormDataViewDto> => {
    return api.get<FormDataViewDto>(`/forms/${id}/data`);
  },

  getPublic: async (publicId: string): Promise<PublicFormDto> => {
    return api.get<PublicFormDto>(`/public/forms/${publicId}`);
  },

  submitPublic: async (
    publicId: string,
    data: Record<string, any>,
  ): Promise<{ message: string; id: string }> => {
    return api.post<{ message: string; id: string }>(`/public/forms/${publicId}/submissions`, {
      data,
    });
  },
};
