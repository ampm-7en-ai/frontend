
import { useState } from "react";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "@/utils/api-config";

export function useDeleteAgent() {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteAgent(agentId: string): Promise<{ success: boolean; message?: string }> {
    setDeleting(agentId);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return { success: false, message: "Authentication required" };
      }
      const url = getApiUrl(`${API_ENDPOINTS.AGENTS}${agentId}/`);
      const resp = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeaders(token),
      });
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => null);
        return {
          success: false,
          message: errorData?.error || `Failed to delete agent. (${resp.status})`,
        };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Delete failed" };
    } finally {
      setDeleting(null);
    }
  }

  return { deleting, deleteAgent };
}
