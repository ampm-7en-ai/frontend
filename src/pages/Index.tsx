
import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { AgentStatusCard } from '@/components/dashboard/AgentStatusCard';
import { RecentConversationsTable } from '@/components/dashboard/RecentConversationsTable';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Bot, MessageCircle, Clock, BarChart2, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

const Index = () => {
  // Redirect to the dashboard 
  return <Navigate to="/dashboard" replace />;
};

export default Index;
