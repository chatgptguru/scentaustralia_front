import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material';
import {
  Chat,
  Description,
  People,
  TrendingUp,
} from '@mui/icons-material';

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const handleAction = (action: string) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
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
              onClick={() => handleAction('ai-chat')}
            >
              Start AI Conversation
            </Button>
            <Button
              variant="outlined"
              startIcon={<Description />}
              fullWidth
              size="large"
              onClick={() => handleAction('documents')}
            >
              Generate Document
            </Button>
            <Button
              variant="outlined"
              startIcon={<People />}
              fullWidth
              size="large"
              onClick={() => handleAction('leads')}
            >
              Find New Leads
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              fullWidth
              size="large"
              onClick={() => handleAction('analytics')}
            >
              View Analytics
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default QuickActions;
