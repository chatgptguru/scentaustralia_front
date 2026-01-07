# Lead Generation Components

## Overview

This directory contains the React components for the automated lead scraping and management system frontend interface.

## Components

### LeadScraping
Configuration interface for setting up and launching scraping jobs.

**Location:** `LeadScraping.tsx`
**Lines:** 400+
**Dependencies:** Material-UI, scraperApi
**Functionality:**
- Dynamic keyword and location management
- Max leads configuration
- AI analysis toggle
- Advanced settings (data source selection)
- Real-time job tracking

### JobProgress
Real-time job monitoring with progress visualization.

**Location:** `JobProgress.tsx`
**Lines:** 350+
**Dependencies:** Material-UI, scraperApi
**Functionality:**
- Progress bar with lead counts
- Status indicators
- Timeline visualization
- Error tracking and display
- Job parameter summary
- Auto-refresh mechanism

### LeadResults
Lead display and management table with search and filtering.

**Location:** `LeadResults.tsx`
**Lines:** 600+
**Dependencies:** Material-UI, Lead API interface
**Functionality:**
- Searchable, paginated lead table
- Lead quality statistics
- Detailed lead modal
- Contact information management
- AI analysis display
- Score-based color coding

## Usage

### Basic Integration

```tsx
import { LeadScraping, JobProgress, LeadResults } from '../../components/LeadGeneration';

// In your component
<LeadScraping
  onJobStarted={(jobId) => setJobId(jobId)}
  onSuccess={(msg) => handleSuccess(msg)}
  onError={(err) => handleError(err)}
/>

<JobProgress
  jobId={jobId}
  onCompleted={(job) => loadResults(job)}
  onClose={() => setJobId(null)}
/>

<LeadResults
  leads={leads}
  onExport={() => exportLeads()}
/>
```

## Props Reference

### LeadScraping Props
```typescript
{
  onJobStarted?: (jobId: string) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}
```

### JobProgress Props
```typescript
{
  jobId: string;
  onCompleted?: (job: ScrapingJob) => void;
  onFailed?: (job: ScrapingJob) => void;
  onClose?: () => void;
}
```

### LeadResults Props
```typescript
{
  leads: Lead[];
  loading?: boolean;
  onLeadSelect?: (lead: Lead) => void;
  onLeadUpdate?: (lead: Lead) => void;
  onLeadDelete?: (leadId: string) => void;
  onExport?: () => void;
}
```

## Integration Points

### With LeadGenerator Page
These components are integrated into the "Generate New Leads" tab of the LeadGenerator page with automatic polling and data refresh.

### With API Service
All components use the `scraperApi` from `src/services/api.ts`:
- `startScraping()` - Initialize job
- `getJobStatus()` - Fetch progress
- `listJobs()` - Get history
- `stopJob()` - Cancel operation
- `getConfig()` - Load configuration

## Features

- ✅ Real-time job tracking with auto-refresh
- ✅ Dynamic keyword/location management
- ✅ Advanced scraping configuration
- ✅ Error handling and display
- ✅ Lead statistics and analytics
- ✅ Searchable lead results
- ✅ Detailed lead information modal
- ✅ AI analysis display
- ✅ Export functionality
- ✅ Responsive design

## Component Communication

```
User
  ↓
LeadScraping (Configure & Start)
  ↓
Backend Scraping Job
  ↓
JobProgress (Monitor Real-time)
  ↓
LeadResults (Display & Manage)
```

## Performance Characteristics

- **LeadScraping:** Instant rendering, no polling
- **JobProgress:** 2-second polling intervals (only while running)
- **LeadResults:** Pagination-based loading (default 10 rows)
- **Memory:** Efficient state management, minimal re-renders

## Styling

All components use Material-UI theming with:
- Primary color (#1976d2) for main actions
- Secondary color (#dc004e) for highlights
- Error color (#f44336) for warnings
- Success color (#4caf50) for confirmations

## Customization

### Colors
Update the color props in Material-UI components:
```tsx
<Chip color="primary" /> // Change to secondary, error, warning, success
<Button color="primary" /> // Change to secondary, error, warning, success
```

### Polling Interval
In JobProgress, change:
```typescript
const interval = setInterval(fetchJobStatus, 2000); // Change 2000 to desired ms
```

### Pagination Defaults
In LeadResults, modify:
```typescript
const [rowsPerPage, setRowsPerPage] = useState(10); // Change default
```

## Dependencies

- React 18+
- Material-UI (MUI) 5+
- TypeScript 4.5+
- API service with scraperApi

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Testing

Components are fully typed with TypeScript. Test with:
1. Backend scraping endpoint mocked
2. Various job statuses (running, completed, failed)
3. Large lead result sets (1000+ leads)
4. Network errors and timeouts

## Troubleshooting

### Components not showing
→ Check imports and ensure backend API endpoints are available

### Polling not updating
→ Verify job ID is correctly passed to JobProgress

### Leads not displaying
→ Ensure Lead interface matches backend response

### Styling issues
→ Confirm Material-UI theme provider wraps parent components

## Related Files

- `src/services/api.ts` - API endpoints
- `src/pages/LeadGenerator/LeadGenerator.tsx` - Integration example
- Backend: `scentaustralia_backend/app/routes/scraper.py` - API routes
- Backend: `scentaustralia_backend/app/services/web_scraper.py` - Scraping logic

## Version History

- v1.0.0 - Initial implementation with LeadScraping, JobProgress, LeadResults components
