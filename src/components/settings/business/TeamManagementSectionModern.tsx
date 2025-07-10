
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  UserPlus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Shield, 
  Crown, 
  User 
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  joinedAt: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-02-01'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'member',
    status: 'pending',
    joinedAt: '2024-03-10'
  }
];

const TeamManagementSectionModern = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const roleOptions = [
    { 
      value: 'owner', 
      label: 'Owner', 
      description: 'Full access and billing control' 
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Manage team and settings' 
    },
    { 
      value: 'member', 
      label: 'Member', 
      description: 'Basic access to agents' 
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleInviteMember = () => {
    if (!inviteEmail) return;
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as 'owner' | 'admin' | 'member',
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0]
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setInviteRole('member');
    setInviteDialogOpen(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== memberId));
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole as 'owner' | 'admin' | 'member' }
        : member
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your team members and their permissions
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <ModernDropdown
                  value={inviteRole}
                  onValueChange={setInviteRole}
                  options={roleOptions}
                  placeholder="Select role"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteMember}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ModernDropdown
                      value={member.role}
                      onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
                      options={roleOptions}
                      trigger={
                        <Badge variant="outline" className={`${getRoleBadgeColor(member.role)} cursor-pointer hover:opacity-80`}>
                          {getRoleIcon(member.role)}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </Badge>
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeColor(member.status)}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {member.role !== 'owner' && (
                    <ModernDropdown
                      value=""
                      onValueChange={(action) => {
                        if (action === 'remove') {
                          handleRemoveMember(member.id);
                        }
                      }}
                      options={[
                        { value: 'edit', label: 'Edit', description: 'Edit member details' },
                        { value: 'remove', label: 'Remove', description: 'Remove from team' }
                      ]}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                      renderOption={(option) => (
                        <div className={`flex items-center gap-3 ${
                          option.value === 'remove'
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          <div className={`p-1 rounded-lg ${
                            option.value === 'remove'
                              ? 'bg-gradient-to-br from-red-500 to-red-600'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {option.value === 'edit' && <Edit className="h-3 w-3 text-white" />}
                            {option.value === 'remove' && <Trash2 className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
                          </div>
                        </div>
                      )}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamManagementSectionModern;
