import type { APIRequestContext } from "@playwright/test";

const runtimeEnv =
  typeof globalThis === "object" && "process" in globalThis
    ? ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {})
    : {};

export const MOCK_API_BASE_URL = runtimeEnv.PLAYWRIGHT_BACKEND_API_BASE_URL || "http://127.0.0.1:4010";

export async function resetMockApi(request: APIRequestContext): Promise<void> {
  // Real backend environments usually do not expose a test reset endpoint.
  // Attempt reset when available and continue when it is not.
  await request.post(`${MOCK_API_BASE_URL}/__test__/reset`).catch(() => undefined);
}

export async function getMockRoles(request: APIRequestContext): Promise<Array<{ jobRoleId: number | string; roleName: string }>> {
  const response = await request.get(`${MOCK_API_BASE_URL}/job-roles`);
  if (!response.ok()) {
    return [];
  }

  const payload = (await response.json()) as Array<{ jobRoleId?: number | string; roleName?: string }>;
  return payload
    .filter((role) => Boolean(role.roleName))
    .map((role, index) => ({
      jobRoleId: role.jobRoleId ?? index + 1,
      roleName: role.roleName as string
    }));
}

export async function getMockApplications(
  request: APIRequestContext
): Promise<Array<{ jobRoleId: number; fileName: string; mimeType: string }>> {
  const response = await request.get(`${MOCK_API_BASE_URL}/applications`);
  if (!response.ok()) {
    return [];
  }

  const payload = (await response.json()) as Array<{ jobRoleId: number; fileName?: string; mimeType?: string }>;
  return payload.map((application) => ({
    jobRoleId: application.jobRoleId,
    fileName: application.fileName || "",
    mimeType: application.mimeType || ""
  }));
}
