import { ID } from '@firelancerco/common/lib/generated-schema';
import { SerializedRequestContext } from '../../common';
import { SearchStrategy } from './search-strategy/search-strategy';

/**
 * @description
 * Options which configure the behaviour of the DefaultSearchPlugin
 */
export interface DefaultSearchPluginInitOptions {
    /**
     * @description
     * If set to `true`, updates to JobPosts and Collections will not immediately
     * trigger an update to the search index. Instead, all these changes will be buffered and will
     * only be run via a call to the `runPendingSearchIndexUpdates` mutation.
     *
     * This is very useful for installations with a large number of JobPosts and/or
     * Collections, as the buffering allows better control over when these expensive jobs are run,
     * and also performs optimizations to minimize the amount of work that needs to be performed by
     * the worker.
     * @default false
     */
    bufferUpdates?: boolean;

    /**
     * @description
     * Set a custom search strategy that implements {@link SearchStrategy} or extends an existing search strategy
     * such as{@link PostgresSearchStrategy}.
     *
     * @default undefined
     */
    searchStrategy?: SearchStrategy;
}

export type ReindexMessageResponse = {
    total: number;
    completed: number;
    duration: number;
};

export type ReindexMessageData = {
    ctx: SerializedRequestContext;
};

export type NamedJobData<T extends string, D> = { type: T } & D;

export type UpdateJobPostMessageData = {
    ctx: SerializedRequestContext;
    jobPostId: ID;
};

export type UpdateProfileMessageData = {
    ctx: SerializedRequestContext;
    profileId: ID;
};

export type ReindexJobData = NamedJobData<'reindex', {}>;
export type UpdateJobPostJobData = NamedJobData<'update-job-post', UpdateJobPostMessageData>;
export type DeleteJobPostJobData = NamedJobData<'delete-job-post', UpdateJobPostMessageData>;
export type UpdateProfileJobData = NamedJobData<'update-profile', UpdateProfileMessageData>;

export type UpdateIndexQueueJobData =
    | ReindexJobData
    | UpdateJobPostJobData
    | DeleteJobPostJobData
    | UpdateProfileJobData;
