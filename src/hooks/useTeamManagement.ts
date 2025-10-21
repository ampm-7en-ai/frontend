import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/utils/api-config';

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: {
    id: number;
    name: string;
    description: string;
  }[];
  is_active: boolean;
  created_at: string;
}

export interface Member {
  id: string;
  email: string | null;
  role: string;
  created_at?: string;
  status: 'pending' | 'active';
  name?: string;
  expires_at?: string;
  used?: boolean;
}

async function fetchTeamRoles(token: string): Promise<Role[]> {
  const response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }
  
  const data = await response.json();
  return data.data;
}

async function fetchTeamMembers(token: string): Promise<Member[]> {
  const response = await fetch(getApiUrl('users/get_team_invites/'), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
    
    if (errorData.error === "Only team owners can view invites") {
      return [];
    }
    
    throw new Error(errorData.error || `Failed to fetch team invites: ${response.status}`);
  }
  
  const inviteData = await response.json();
  
  // Format the invites as members with active/pending status based on 'used' property
  const formattedMembers: Member[] = inviteData.data.map((invite: any) => ({
    id: invite.id.toString(),
    email: invite.email,
    role: invite.team_role,
    status: invite.used ? 'active' : 'pending',
    name: invite.email,
    created_at: invite.created_at || new Date().toISOString(),
    expires_at: invite.expires_at,
    used: invite.used
  }));
  
  return formattedMembers.sort(a => a.used ? -1 : 1);
}

export function useTeamRoles() {
  const { getToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['teamRoles'],
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to view roles");
      return fetchTeamRoles(token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: isAuthenticated,
  });
}

export function useTeamMembers() {
  const { getToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to view team members");
      return fetchTeamMembers(token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: isAuthenticated,
  });
}

export function useCreateTeamInvite() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ email, team_role_id }: { email: string; team_role_id: number }) => {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to send invitations");

      const response = await fetch(getApiUrl('users/create_team_invite/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(token),
          "X-Frontend-URL": window.location.origin,
        },
        body: JSON.stringify({ email, team_role_id }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error) {
          if (responseData.error.fields?.email) {
            throw new Error(responseData.error.fields.email[0]);
          }
          throw new Error(responseData.error.message || "Failed to send invitation");
        }
        throw new Error(`Failed to send invitation: ${response.status}`);
      }

      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useCancelInvite() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to cancel invitations");

      const response = await fetch(getApiUrl(API_ENDPOINTS.REMOVE_INVITE), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ invite_id: inviteId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
        throw new Error(errorData.error || `Failed to cancel invitation: ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to remove team members");

      const response = await fetch(getApiUrl(API_ENDPOINTS.REMOVE_MEMBER), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ invite_id: memberId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `Failed to remove team member: ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
  });
}
