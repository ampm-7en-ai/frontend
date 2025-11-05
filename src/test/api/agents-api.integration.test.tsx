import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { mockApiSuccess, mockApiError } from '@/test/helpers/integration-helpers';

// Mock API functions
const fetchAgents = async () => {
  const response = await fetch('/api/agents');
  if (!response.ok) throw new Error('Failed to fetch agents');
  return response.json();
};

const createAgent = async (agentData: any) => {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentData),
  });
  if (!response.ok) throw new Error('Failed to create agent');
  return response.json();
};

const updateAgent = async ({ id, data }: { id: string; data: any }) => {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update agent');
  return response.json();
};

const deleteAgent = async (id: string) => {
  const response = await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete agent');
  return response.json();
};

// Custom hooks for testing
const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  });
};

const useCreateAgent = () => {
  return useMutation({
    mutationFn: createAgent,
  });
};

const useUpdateAgent = () => {
  return useMutation({
    mutationFn: updateAgent,
  });
};

const useDeleteAgent = () => {
  return useMutation({
    mutationFn: deleteAgent,
  });
};

describe('Agents API Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch agents list successfully', async () => {
    const mockAgents = [
      { id: '1', name: 'Agent 1', description: 'Test agent 1' },
      { id: '2', name: 'Agent 2', description: 'Test agent 2' },
    ];

    mockApiSuccess('/api/agents', { agents: mockAgents });

    const { result } = renderHook(() => useAgents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ agents: mockAgents });
  });

  it('should handle fetch agents error', async () => {
    mockApiError('/api/agents', 'Failed to fetch agents', 500);

    const { result } = renderHook(() => useAgents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Failed to fetch agents');
  });

  it('should create a new agent successfully', async () => {
    const newAgent = {
      name: 'New Agent',
      description: 'A new test agent',
      model: 'gpt-4',
    };

    const createdAgent = { id: '3', ...newAgent };

    mockApiSuccess('/api/agents', { agent: createdAgent });

    const { result } = renderHook(() => useCreateAgent(), { wrapper });

    result.current.mutate(newAgent);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ agent: createdAgent });
  });

  it('should handle create agent validation error', async () => {
    const invalidAgent = {
      name: '', // Invalid - empty name
      description: 'Test',
    };

    mockApiError('/api/agents', 'Name is required', 400);

    const { result } = renderHook(() => useCreateAgent(), { wrapper });

    result.current.mutate(invalidAgent);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toContain('Failed to create agent');
  });

  it('should update an agent successfully', async () => {
    const agentId = '1';
    const updates = {
      name: 'Updated Agent Name',
      description: 'Updated description',
    };

    const updatedAgent = { id: agentId, ...updates };

    mockApiSuccess(`/api/agents/${agentId}`, { agent: updatedAgent });

    const { result } = renderHook(() => useUpdateAgent(), { wrapper });

    result.current.mutate({ id: agentId, data: updates });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ agent: updatedAgent });
  });

  it('should handle update agent not found error', async () => {
    const agentId = 'nonexistent';
    const updates = { name: 'Updated Name' };

    mockApiError(`/api/agents/${agentId}`, 'Agent not found', 404);

    const { result } = renderHook(() => useUpdateAgent(), { wrapper });

    result.current.mutate({ id: agentId, data: updates });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should delete an agent successfully', async () => {
    const agentId = '1';

    mockApiSuccess(`/api/agents/${agentId}`, { success: true });

    const { result } = renderHook(() => useDeleteAgent(), { wrapper });

    result.current.mutate(agentId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ success: true });
  });

  it('should handle delete agent error', async () => {
    const agentId = '1';

    mockApiError(`/api/agents/${agentId}`, 'Cannot delete agent with active conversations', 409);

    const { result } = renderHook(() => useDeleteAgent(), { wrapper });

    result.current.mutate(agentId);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should handle concurrent API calls', async () => {
    const mockAgents = [{ id: '1', name: 'Agent 1' }];
    mockApiSuccess('/api/agents', { agents: mockAgents });

    const { result: result1 } = renderHook(() => useAgents(), { wrapper });
    const { result: result2 } = renderHook(() => useAgents(), { wrapper });

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
      expect(result2.current.isSuccess).toBe(true);
    });

    // Both should have the same data from cache
    expect(result1.current.data).toEqual(result2.current.data);
  });
});
