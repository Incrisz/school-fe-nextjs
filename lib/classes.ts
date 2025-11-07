import { API_ROUTES } from "@/lib/config";
import { apiFetch } from "@/lib/apiClient";

export interface SchoolClass {
  id: number;
  name: string;
  school_id?: number;
  [key: string]: unknown;
}

type ClassesResponse =
  | SchoolClass[]
  | {
      data?: SchoolClass[];
      [key: string]: unknown;
    };

function normalizeClasses(payload: ClassesResponse): SchoolClass[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
}

export async function listClasses(): Promise<SchoolClass[]> {
  try {
    const payload = await apiFetch<ClassesResponse>(API_ROUTES.classes);
    return normalizeClasses(payload);
  } catch (error) {
    // If it's a 403 error, return empty array (permission denied - user shouldn't see classes)
    if (error instanceof Error && ((error as Error & { status?: number }).status === 403 || error.message.includes("403") || error.message.includes("permission"))) {
      return [];
    }
    // For other errors, re-throw
    throw error;
  }
}

export async function getClass(
  classId: number | string,
): Promise<SchoolClass | null> {
  try {
    return await apiFetch<SchoolClass>(`${API_ROUTES.classes}/${classId}`);
  } catch (error) {
    console.error("Unable to load class", error);
    return null;
  }
}

export interface CreateClassPayload {
  name: string;
  school_id: number;
}

export async function createClass(
  payload: CreateClassPayload,
): Promise<SchoolClass> {
  return apiFetch<SchoolClass>(API_ROUTES.classes, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClass(
  classId: number | string,
  payload: { name: string },
): Promise<SchoolClass> {
  return apiFetch<SchoolClass>(`${API_ROUTES.classes}/${classId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteClass(classId: number | string): Promise<void> {
  await apiFetch(`${API_ROUTES.classes}/${classId}`, {
    method: "DELETE",
  });
}
