import { Type } from '@firelancerco/common/lib/shared-types';
import { SearchIndex } from '@firelancerco/common/lib/generated-schema';

import { JobPostSearchIndexItem } from './job-post-search-index-item.entity';
import { ProfileSearchIndexItem } from './profile-search-index-item.entity';
import { SearchIndexItem } from './search-index-item.entity';

export const searchIndexes: Record<SearchIndex, Type<SearchIndexItem>> = {
    [SearchIndex.JobPost]: JobPostSearchIndexItem,
    [SearchIndex.Profile]: ProfileSearchIndexItem,
};
