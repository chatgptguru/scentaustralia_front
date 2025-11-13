import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Box,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface PerformanceMetric {
  title: string;
  current: number;
  target: number;
  unit: string;
  status: 'excellent' | 'good' | 'needs-improvement';
}

interface PerformanceOverviewProps {
  metrics: PerformanceMetric[];
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ metrics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'needs-improvement': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs-improvement': return 'Needs Improvement';
      default: return 'Unknown';
    }
  };

  return (
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Performance Overview
          </Typography>
          <Grid container spacing={3}>
            {metrics.map((metric, index) => {
              const percentage = (metric.current / metric.target) * 100;
              return (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        Target: {metric.target} {metric.unit}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {metric.current}/{metric.target}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percentage, 100)}
                        color={getStatusColor(metric.status) as any}
                        sx={{ height: 8, borderRadius: 4, flex: 1, mr: 2 }}
                      />
                      <Chip
                        label={getStatusLabel(metric.status)}
                        size="small"
                        color={getStatusColor(metric.status) as any}
                        icon={metric.status === 'excellent' ? <CheckCircle /> : undefined}
                      />
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default PerformanceOverview;
