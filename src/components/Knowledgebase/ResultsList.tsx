import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Avatar,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import {
  PictureAsPdf,
  VideoLibrary,
  Article,
  LibraryBooks,
  Assessment,
  Visibility,
  Download,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';

interface KnowledgeItem {
  id: string;
  title: string;
  type: 'document' | 'video' | 'article' | 'faq' | 'policy';
  category: string;
  content: string;
  author: string;
  lastUpdated: Date;
  views: number;
  tags: string[];
  isBookmarked: boolean;
  source: 'salesforce' | 'automation-king' | 'internal' | 'external';
}

interface ResultsListProps {
  items: KnowledgeItem[];
  onToggleBookmark: (id: string) => void;
  onViewItem: (id: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({ items, onToggleBookmark, onViewItem }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <PictureAsPdf />;
      case 'video': return <VideoLibrary />;
      case 'article': return <Article />;
      case 'faq': return <LibraryBooks />;
      case 'policy': return <Assessment />;
      default: return <Article />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'error';
      case 'video': return 'info';
      case 'article': return 'success';
      case 'faq': return 'warning';
      case 'policy': return 'secondary';
      default: return 'default';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'salesforce': return 'primary';
      case 'automation-king': return 'secondary';
      case 'internal': return 'success';
      case 'external': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Search Results ({items.length})
      </Typography>
      {items.map((item) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ bgcolor: `${getTypeColor(item.type)}.main`, mr: 2 }}>
                {getTypeIcon(item.type)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {item.title}
                  </Typography>
                  <IconButton onClick={() => onToggleBookmark(item.id)}>
                    {item.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={item.type} size="small" color={getTypeColor(item.type) as any} />
                  <Chip label={item.source} size="small" color={getSourceColor(item.source) as any} variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    by {item.author} • {item.views} views • Updated {item.lastUpdated.toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                  {item.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" startIcon={<Visibility />} onClick={() => onViewItem(item.id)}>
                View
              </Button>
              <Button size="small" startIcon={<Download />}>
                Download
              </Button>
              <Button size="small" startIcon={<Share />}>
                Share
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ResultsList;
