import { api } from './api';
import {
  CreateFormDto,
  CreateVersionDto,
  FormDataViewDto,
  FormDto,
  FormVersionDto,
  PublicFormDto,
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

  deployVersion: async (id: string, versionId: string): Promise<FormDto> => {
    return api.post<FormDto>(`/forms/${id}/versions/${versionId}/deploy`);
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
