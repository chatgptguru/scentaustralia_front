import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Description,
  People,
  Chat,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
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
      type: 'lead',
      status: 'new',
    },
    {
      title: 'Quote document generated for Retail Solutions Inc',
      time: '15 minutes ago',
      type: 'document',
      status: 'completed',
    },
    {
      title: 'AI consultation completed for product recommendations',
      time: '1 hour ago',
      type: 'ai',
      status: 'completed',
    },
    {
      title: 'Lead scoring updated for 5 prospects',
      time: '2 hours ago',
      type: 'lead',
      status: 'updated',
    },
  ];

  const pendingTasks = [
    { task: 'Follow up with Luxury Retail Group', priority: 'high', dueDate: 'Today' },
    { task: 'Generate proposal for Boutique Chain', priority: 'medium', dueDate: 'Tomorrow' },
    { task: 'Update CRM with new lead information', priority: 'low', dueDate: 'This week' },
    { task: 'Review AI-generated market analysis', priority: 'medium', dueDate: 'Friday' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead': return <People />;
      case 'document': return <Description />;
      case 'ai': return <Chat />;
      default: return <Assignment />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Welcome back to Scent Australia AI
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}.main`,
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Chat />}
                  fullWidth
                  size="large"
                >
                  Start AI Conversation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Description />}
                  fullWidth
                  size="large"
                >
                  Generate Document
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<People />}
                  fullWidth
                  size="large"
                >
                  Find New Leads
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  fullWidth
                  size="large"
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.time}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Tasks */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Pending Tasks
              </Typography>
              <List>
                {pendingTasks.map((task, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'grey.100', width: 32, height: 32 }}>
                          <Schedule color="action" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {task.task}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority) as any}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={`Due: ${task.dueDate}`}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                    {index < pendingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Performance Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Lead Conversion Progress
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Monthly Target: 150 leads
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        127/150
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={84.7}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Document Generation Efficiency
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Average time: 2.3 minutes
                      </Typography>
                      <Chip
                        label="Excellent"
                        size="small"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={92}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
