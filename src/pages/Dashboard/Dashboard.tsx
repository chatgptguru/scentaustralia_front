import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Description,
  People,
  Chat,
} from '@mui/icons-material';

// Import components
import StatsCards from '../../components/Dashboard/StatsCards';
import QuickActions from '../../components/Dashboard/QuickActions';
import RecentActivities from '../../components/Dashboard/RecentActivities';
import PendingTasks from '../../components/Dashboard/PendingTasks';
import PerformanceOverview from '../../components/Dashboard/PerformanceOverview';
import PageHeader from '../../components/Common/PageHeader';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickStats = [
    {
      title: 'Active Leads',
      value: '127',
      change: '+12%',
      icon: <People />,
      color: 'primary',
    },
    {
      title: 'Documents Generated',
      value: '45',
      change: '+8%',
      icon: <Description />,
      color: 'secondary',
    },
    {
      title: 'AI Conversations',
      value: '89',
      change: '+23%',
      icon: <Chat />,
      color: 'success',
    },
    {
      title: 'Conversion Rate',
      value: '18.5%',
      change: '+3.2%',
      icon: <TrendingUp />,
      color: 'info',
    },
  ];

  const recentActivities = [
    {
      title: 'New lead generated for Premium Fragrances Ltd',
      time: '2 minutes ago',
      type: 'lead' as const,
      status: 'new',
    },
    {
      title: 'Quote document generated for Retail Solutions Inc',
      time: '15 minutes ago',
      type: 'document' as const,
      status: 'completed',
    },
    {
      title: 'AI consultation completed for product recommendations',
      time: '1 hour ago',
      type: 'ai' as const,
      status: 'completed',
    },
    {
      title: 'Lead scoring updated for 5 prospects',
      time: '2 hours ago',
      type: 'lead' as const,
      status: 'updated',
    },
  ];

  const pendingTasks = [
    { task: 'Follow up with Luxury Retail Group', priority: 'high' as const, dueDate: 'Today' },
    { task: 'Generate proposal for Boutique Chain', priority: 'medium' as const, dueDate: 'Tomorrow' },
    { task: 'Update CRM with new lead information', priority: 'low' as const, dueDate: 'This week' },
    { task: 'Review AI-generated market analysis', priority: 'medium' as const, dueDate: 'Friday' },
  ];

  const performanceMetrics = [
    {
      title: 'Lead Conversion Progress',
      current: 127,
      target: 150,
      unit: 'leads',
      status: 'good' as const,
    },
    {
      title: 'Document Generation Efficiency',
      current: 45,
      target: 40,
      unit: 'documents',
      status: 'excellent' as const,
    },
  ];

  const handleQuickAction = (action: string) => {
    navigate(`/${action}`);
  };

  return (
    <Box>
      <PageHeader
        title="Welcome back to Scent Australia AI"
        subtitle="Here's what's happening with your business today"
      />

      {/* Stats Cards */}
      <StatsCards stats={quickStats} />

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        <QuickActions onActionClick={handleQuickAction} />
        <RecentActivities activities={recentActivities} />
        <PendingTasks tasks={pendingTasks} />
        <PerformanceOverview metrics={performanceMetrics} />
      </Grid>
    </Box>
  );
};

export default Dashboard;
