import type { APIRequestContext } from "@playwright/test";

export const MOCK_API_BASE_URL = "http://127.0.0.1:4010";

export async function resetMockApi(request: APIRequestContext): Promise<void> {
  await request.post(`${MOCK_API_BASE_URL}/__test__/reset`);
}

export async function getMockRoles(request: APIRequestContext): Promise<Array<{ jobRoleId: number | string; roleName: string }>> {
  const response = await request.get(`${MOCK_API_BASE_URL}/__test__/roles`);
  const payload = (await response.json()) as {
    roles: Array<{ jobRoleId: number | string; roleName: string }>;
  };
  return payload.roles;
}

export async function getMockApplications(
  request: APIRequestContext
): Promise<Array<{ jobRoleId: number; fileName: string; mimeType: string }>> {
  const response = await request.get(`${MOCK_API_BASE_URL}/__test__/applications`);
  const payload = (await response.json()) as {
    applications: Array<{ jobRoleId: number; fileName: string; mimeType: string }>;
  };
  return payload.applications;
}
