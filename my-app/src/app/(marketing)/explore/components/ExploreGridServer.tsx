import React from 'react';
import { companionService } from '@/shared/services/companionService';
import { ExploreGridClient } from './ExploreGridClient';

export async function ExploreGridServer() {
  const { items, hasNextPage } = await companionService.getCompanions({
    limit: 6,
  });

  return (
    <ExploreGridClient 
      initialCompanions={items} 
      initialHasNextPage={hasNextPage} 
    />
  );
}

export default ExploreGridServer;
