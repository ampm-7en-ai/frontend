import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders, mockApiSuccess, mockApiError } from '@/test/helpers/integration-helpers';

// Mock AgentCard Component
interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  description?: string;
}

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: string) => void;
  onStatusToggle?: (id: string) => void;
}

const AgentCard = ({ agent, onDelete, onStatusToggle }: AgentCardProps) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete agent');
      }

      onDelete?.(agent.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async () => {
    setIsToggling(true);
    setError('');
    
    try {
      const newStatus = agent.status === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      onStatusToggle?.(agent.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div data-testid={`agent-card-${agent.id}`}>
      <h3>{agent.name}</h3>
      {agent.description && <p>{agent.description}</p>}
      <div data-testid="agent-status">
        Status: <span className={agent.status}>{agent.status}</span>
      </div>
      
      {error && <div role="alert" className="error">{error}</div>}
      
      <div className="actions">
        <button 
          onClick={handleStatusToggle} 
          disabled={isToggling}
          data-testid="toggle-status-btn"
        >
          {isToggling ? 'Updating...' : 'Toggle Status'}
        </button>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          data-testid="delete-btn"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

describe('AgentCard Component Integration', () => {
  const mockAgent: Agent = {
    id: '123',
    name: 'Test Agent',
    status: 'active',
    description: 'A test agent for integration testing',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  it('should render agent information correctly', () => {
    renderWithProviders(<AgentCard agent={mockAgent} />);

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByText('A test agent for integration testing')).toBeInTheDocument();
    expect(screen.getByTestId('agent-status')).toHaveTextContent('Status: active');
  });

  it('should toggle agent status when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onStatusToggle = vi.fn();

    mockApiSuccess(`/api/agents/${mockAgent.id}`, { 
      agent: { ...mockAgent, status: 'inactive' } 
    });

    renderWithProviders(
      <AgentCard agent={mockAgent} onStatusToggle={onStatusToggle} />
    );

    const toggleButton = screen.getByTestId('toggle-status-btn');
    await user.click(toggleButton);

    // Should show loading state
    expect(screen.getByText('Updating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(onStatusToggle).toHaveBeenCalledWith(mockAgent.id);
    });
  });

  it('should delete agent when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    mockApiSuccess(`/api/agents/${mockAgent.id}`, { success: true });

    renderWithProviders(
      <AgentCard agent={mockAgent} onDelete={onDelete} />
    );

    const deleteButton = screen.getByTestId('delete-btn');
    await user.click(deleteButton);

    // Should show loading state
    expect(screen.getByText('Deleting...')).toBeInTheDocument();

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockAgent.id);
    });
  });

  it('should not delete agent when deletion is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    // Mock confirm to return false (cancel)
    global.confirm = vi.fn(() => false);

    renderWithProviders(
      <AgentCard agent={mockAgent} onDelete={onDelete} />
    );

    const deleteButton = screen.getByTestId('delete-btn');
    await user.click(deleteButton);

    // Should not call API or callback
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('should display error when status toggle fails', async () => {
    const user = userEvent.setup();

    mockApiError(`/api/agents/${mockAgent.id}`, 'Failed to update status', 500);

    renderWithProviders(<AgentCard agent={mockAgent} />);

    const toggleButton = screen.getByTestId('toggle-status-btn');
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to update status');
    });

    // Button should be enabled again
    expect(toggleButton).not.toBeDisabled();
  });

  it('should display error when deletion fails', async () => {
    const user = userEvent.setup();

    mockApiError(`/api/agents/${mockAgent.id}`, 'Failed to delete agent', 403);

    renderWithProviders(<AgentCard agent={mockAgent} />);

    const deleteButton = screen.getByTestId('delete-btn');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to delete agent');
    });

    // Button should be enabled again
    expect(deleteButton).not.toBeDisabled();
  });

  it('should disable buttons while operations are in progress', async () => {
    const user = userEvent.setup();

    // Mock slow API response
    global.fetch = vi.fn(() => 
      new Promise<Response>((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            json: async () => ({}),
          } as Response);
        }, 100);
      })
    );

    renderWithProviders(<AgentCard agent={mockAgent} />);

    const toggleButton = screen.getByTestId('toggle-status-btn');
    await user.click(toggleButton);

    // Button should be disabled during operation
    expect(toggleButton).toBeDisabled();

    await waitFor(() => {
      expect(toggleButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  it('should render without optional props', () => {
    renderWithProviders(<AgentCard agent={mockAgent} />);

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-status-btn')).toBeInTheDocument();
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
  });

  it('should handle agent without description', () => {
    const agentWithoutDesc = { ...mockAgent, description: undefined };
    
    renderWithProviders(<AgentCard agent={agentWithoutDesc} />);

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
    expect(screen.queryByText('A test agent for integration testing')).not.toBeInTheDocument();
  });

  it('should display correct status styling', () => {
    const { rerender } = renderWithProviders(<AgentCard agent={mockAgent} />);

    let statusSpan = screen.getByText('active');
    expect(statusSpan).toHaveClass('active');

    // Test inactive status
    const inactiveAgent = { ...mockAgent, status: 'inactive' as const };
    rerender(<AgentCard agent={inactiveAgent} />);

    statusSpan = screen.getByText('inactive');
    expect(statusSpan).toHaveClass('inactive');
  });
});
