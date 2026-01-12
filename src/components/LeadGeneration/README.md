# Lead Generation Components

React components for Apollo.io powered lead generation.

## Components

### ApolloSearch

Main component for searching and generating leads from Apollo.io.

```tsx
import { ApolloSearch } from './LeadGeneration';

<ApolloSearch
  onJobStarted={(jobId) => console.log('Job started:', jobId)}
  onSuccess={(message) => console.log('Success:', message)}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Search for people or organizations
- Filter by job titles, locations, and industries
- AI analysis toggle
- Save to database option
- Real-time job progress tracking

### JobProgress

Component to display real-time progress of a lead generation job.

```tsx
import { JobProgress } from './LeadGeneration';

<JobProgress
  jobId="apollo_20260112_123456"
  onCompleted={(job) => console.log('Completed:', job)}
  onFailed={(job) => console.log('Failed:', job)}
  onClose={() => setJobId(null)}
/>
```

### LeadResults

Component to display and manage generated leads.

```tsx
import { LeadResults } from './LeadGeneration';

<LeadResults
  leads={leads}
  loading={loading}
  onLeadSelect={(lead) => openLeadDetail(lead)}
  onLeadUpdate={(lead) => refreshLeads()}
  onLeadDelete={(leadId) => deleteLead(leadId)}
  onExport={handleExport}
/>
```

## API Integration

These components use the `apolloApi` from `services/api.ts`:

- `apolloApi.getConfig()` - Get configuration and available filters
- `apolloApi.generateLeads()` - Start lead generation job
- `apolloApi.getJobStatus()` - Poll job progress
- `apolloApi.searchPeople()` - Direct search for contacts
- `apolloApi.searchOrganizations()` - Direct search for companies
