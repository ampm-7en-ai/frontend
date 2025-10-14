import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders, mockApiSuccess, mockApiError } from '@/test/helpers/integration-helpers';

// Mock Dashboard Component
const Dashboard = () => {
  const [agents, setAgents] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agents');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setAgents(data.agents || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAgents();
  };

  if (isLoading) return <div data-testid="loading">Loading dashboard...</div>;
  if (error) return <div role="alert">{error}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleRefresh}>Refresh</button>
      <div data-testid="agent-count">Total Agents: {agents.length}</div>
      <div data-testid="agents-list">
        {agents.map((agent) => (
          <div key={agent.id} data-testid={`agent-${agent.id}`}>
            <h3>{agent.name}</h3>
            <p>{agent.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('Dashboard Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockApiSuccess('/api/agents', { agents: [] });
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should fetch and display agents on mount', async () => {
    const mockAgents = [
      { id: '1', name: 'Agent Alpha', status: 'active' },
      { id: '2', name: 'Agent Beta', status: 'inactive' },
    ];

    mockApiSuccess('/api/agents', { agents: mockAgents });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('agent-count')).toHaveTextContent('Total Agents: 2');
    expect(screen.getByText('Agent Alpha')).toBeInTheDocument();
    expect(screen.getByText('Agent Beta')).toBeInTheDocument();
  });

  it('should display error message when API fails', async () => {
    mockApiError('/api/agents', 'Failed to fetch agents', 500);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch agents');
    expect(screen.queryByTestId('agents-list')).not.toBeInTheDocument();
  });

  it('should handle empty agents list', async () => {
    mockApiSuccess('/api/agents', { agents: [] });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('agent-count')).toHaveTextContent('Total Agents: 0');
  });

  it('should refresh data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    
    const initialAgents = [
      { id: '1', name: 'Agent Alpha', status: 'active' },
    ];

    mockApiSuccess('/api/agents', { agents: initialAgents });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Agent Alpha')).toBeInTheDocument();
    });

    // Update mock for refresh
    const updatedAgents = [
      { id: '1', name: 'Agent Alpha', status: 'active' },
      { id: '2', name: 'Agent Beta', status: 'active' },
    ];

    mockApiSuccess('/api/agents', { agents: updatedAgents });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByTestId('agent-count')).toHaveTextContent('Total Agents: 2');
    });
  });

  it('should display correct agent status', async () => {
    const mockAgents = [
      { id: '1', name: 'Active Agent', status: 'active' },
      { id: '2', name: 'Inactive Agent', status: 'inactive' },
    ];

    mockApiSuccess('/api/agents', { agents: mockAgents });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });
});
