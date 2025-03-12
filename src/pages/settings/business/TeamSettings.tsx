import React from 'react';
import BusinessSettingsNav from '@/components/settings/BusinessSettingsNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Users } from 'lucide-react';

const TeamSettings = () => {
  // Sample team members data
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'Admin',
      avatar: '/avatars/01.png',
    },
    {
      id: 2,
      name: 'Emily Smith',
      email: 'emily.smith@example.com',
      role: 'Agent',
      avatar: '/avatars/02.png',
    },
    {
      id: 3,
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'Agent',
      avatar: '/avatars/03.png',
    },
  ];

  return (
    <div className="flex">
      <BusinessSettingsNav />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Team Management</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team and their roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="border rounded-md p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium">{member.name}</h3>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Summary</CardTitle>
            <CardDescription>Overview of your team's roles and permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Total Team Members</div>
                <div className="text-sm">{teamMembers.length}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Admins</div>
                <div className="text-sm">
                  {teamMembers.filter((member) => member.role === 'Admin').length}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Agents</div>
                <div className="text-sm">
                  {teamMembers.filter((member) => member.role === 'Agent').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSettings;
