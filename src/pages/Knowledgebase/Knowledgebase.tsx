import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  LibraryBooks,
  Article,
  VideoLibrary,
  PictureAsPdf,
  Link,
  ExpandMore,
  Bookmark,
  BookmarkBorder,
  Share,
  Download,
  Visibility,
  TrendingUp,
  Schedule,
  Person,
  Business,
  Assessment,
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

const Knowledgebase: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  const knowledgeItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'Premium Fragrance Product Catalog 2024',
      type: 'document',
      category: 'Products',
      content: 'Comprehensive catalog of all premium fragrance products including specifications, pricing, and availability.',
      author: 'Product Team',
      lastUpdated: new Date('2024-11-01'),
      views: 245,
      tags: ['products', 'catalog', 'pricing'],
      isBookmarked: true,
      source: 'internal',
    },
    {
      id: '2',
      title: 'Customer Onboarding Process',
      type: 'article',
      category: 'Processes',
      content: 'Step-by-step guide for onboarding new customers, including documentation requirements and timeline.',
      author: 'Sales Team',
      lastUpdated: new Date('2024-10-28'),
      views: 189,
      tags: ['onboarding', 'customers', 'process'],
      isBookmarked: false,
      source: 'salesforce',
    },
    {
      id: '3',
      title: 'Market Analysis Q3 2024',
      type: 'document',
      category: 'Market Research',
      content: 'Detailed analysis of market trends, competitor activities, and growth opportunities in the fragrance industry.',
      author: 'Research Team',
      lastUpdated: new Date('2024-10-15'),
      views: 156,
      tags: ['market', 'analysis', 'trends'],
      isBookmarked: true,
      source: 'internal',
    },
    {
      id: '4',
      title: 'Salesforce Integration Guide',
      type: 'video',
      category: 'Technology',
      content: 'Video tutorial on how to effectively use Salesforce integration features for lead management.',
      author: 'IT Team',
      lastUpdated: new Date('2024-10-20'),
      views: 98,
      tags: ['salesforce', 'integration', 'tutorial'],
      isBookmarked: false,
      source: 'automation-king',
    },
    {
      id: '5',
      title: 'Frequently Asked Questions',
      type: 'faq',
      category: 'Support',
      content: 'Common questions and answers about products, services, and company policies.',
      author: 'Support Team',
      lastUpdated: new Date('2024-11-03'),
      views: 312,
      tags: ['faq', 'support', 'help'],
      isBookmarked: false,
      source: 'internal',
    },
  ];

  const categories = [
    { name: 'all', label: 'All Categories', count: knowledgeItems.length },
    { name: 'Products', label: 'Products', count: knowledgeItems.filter(item => item.category === 'Products').length },
    { name: 'Processes', label: 'Processes', count: knowledgeItems.filter(item => item.category === 'Processes').length },
    { name: 'Market Research', label: 'Market Research', count: knowledgeItems.filter(item => item.category === 'Market Research').length },
    { name: 'Technology', label: 'Technology', count: knowledgeItems.filter(item => item.category === 'Technology').length },
    { name: 'Support', label: 'Support', count: knowledgeItems.filter(item => item.category === 'Support').length },
  ];

  const recentActivity = [
    { action: 'Document updated', item: 'Premium Fragrance Catalog', user: 'Product Team', time: '2 hours ago' },
    { action: 'New article added', item: 'Customer Success Stories', user: 'Marketing Team', time: '1 day ago' },
    { action: 'FAQ updated', item: 'Product Questions', user: 'Support Team', time: '2 days ago' },
    { action: 'Video uploaded', item: 'Training Session Recording', user: 'HR Team', time: '3 days ago' },
  ];

  const popularTags = [
    { tag: 'products', count: 45 },
    { tag: 'customers', count: 38 },
    { tag: 'pricing', count: 32 },
    { tag: 'process', count: 28 },
    { tag: 'training', count: 25 },
    { tag: 'integration', count: 22 },
  ];

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

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const toggleBookmark = (id: string) => {
    // Implementation for bookmarking
    console.log('Toggle bookmark for:', id);
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderSearchAndBrowse = () => (
    <Grid container spacing={3}>
      {/* Search Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Search Knowledge Base
            </Typography>
            <TextField
              fullWidth
              placeholder="Search for documents, articles, FAQs, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <Chip
                  key={category.name}
                  label={`${category.label} (${category.count})`}
                  onClick={() => setSelectedCategory(category.name)}
                  color={selectedCategory === category.name ? 'primary' : 'default'}
                  variant={selectedCategory === category.name ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Results */}
      <Grid item xs={12} md={8}>
        <Typography variant="h6" gutterBottom>
          Search Results ({filteredItems.length})
        </Typography>
        {filteredItems.map((item) => (
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
                    <IconButton onClick={() => toggleBookmark(item.id)}>
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
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<Visibility />}>
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
      </Grid>

      {/* Sidebar */}
      <Grid item xs={12} md={4}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Popular Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {popularTags.map((tagItem) => (
                <Chip
                  key={tagItem.tag}
                  label={`${tagItem.tag} (${tagItem.count})`}
                  size="small"
                  onClick={() => setSearchQuery(tagItem.tag)}
                  clickable
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        <Schedule fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.item} by ${activity.user} • ${activity.time}`}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFAQ = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Frequently Asked Questions
      </Typography>
      
      {[
        {
          question: 'How do I access customer data from Salesforce?',
          answer: 'You can access customer data through the integrated dashboard. Navigate to the Customer section and use the search functionality to find specific accounts. All data is synchronized in real-time with Salesforce.',
        },
        {
          question: 'What are the available fragrance product categories?',
          answer: 'We offer several categories including Premium Luxury, Boutique Collections, Corporate Solutions, and Custom Blends. Each category has different pricing tiers and minimum order quantities.',
        },
        {
          question: 'How do I generate a quote for a new client?',
          answer: 'Use the Document Generator tool to create quotes. Select the appropriate template, enter client information, and the AI will help customize the content based on their requirements and industry.',
        },
        {
          question: 'How often is the lead database updated?',
          answer: 'The lead database is updated continuously through our AI scraping system. New leads are added daily, and existing lead information is refreshed weekly to ensure accuracy.',
        },
        {
          question: 'Can I export customer and lead data?',
          answer: 'Yes, you can export data in various formats including CSV, Excel, and PDF. Use the export functions available in each section, and ensure you have the appropriate permissions.',
        },
      ].map((faq, index) => (
        <Accordion
          key={index}
          expanded={expandedAccordion === `panel${index}`}
          onChange={handleAccordionChange(`panel${index}`)}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Most Viewed Content
            </Typography>
            <List>
              {knowledgeItems
                .sort((a, b) => b.views - a.views)
                .slice(0, 5)
                .map((item, index) => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={`${item.views} views`}
                      primaryTypographyProps={{ fontSize: '0.875rem' }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItem>
                ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Content by Source
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['internal', 'salesforce', 'automation-king', 'external'].map((source) => {
                const count = knowledgeItems.filter(item => item.source === source).length;
                const percentage = (count / knowledgeItems.length) * 100;
                return (
                  <Box key={source}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {source.replace('-', ' ')}
                      </Typography>
                      <Typography variant="body2">{count} items</Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          bgcolor: `${getSourceColor(source)}.main`,
                          height: '100%',
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Knowledge Base
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access all company knowledge, documentation, and resources in one place
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Search & Browse" />
          <Tab label="FAQ" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderSearchAndBrowse()}
      {activeTab === 1 && renderFAQ()}
      {activeTab === 2 && renderAnalytics()}
    </Box>
  );
};

export default Knowledgebase;
