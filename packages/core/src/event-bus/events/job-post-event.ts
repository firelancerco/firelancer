import {
    CreateJobPostInput,
    EditDraftJobPostInput,
    EditPublishedJobPostInput,
    ID,
} from '@firelancerco/common/lib/generated-shop-schema';
import { RequestContext } from '../../common';
import { JobPost } from '../../entity';
import { FirelancerEntityEvent } from '../firelancer-entity-event';

type JobPostInputTypes = CreateJobPostInput | EditDraftJobPostInput | EditPublishedJobPostInput | ID;

/**
 * @description
 * This event is fired whenever a JobPost is added, updated or deleted.
 */
export class JobPostEvent extends FirelancerEntityEvent<JobPost, JobPostInputTypes> {
    constructor(
        ctx: RequestContext,
        entity: JobPost,
        type: 'created' | 'updated' | 'deleted',
        input?: JobPostInputTypes,
    ) {
        super(entity, type, ctx, input);
    }
}
