import { awaitPromiseOrObservable } from '@firelancerco/common/lib/shared-utils';
import { Injectable } from '@nestjs/common';

import {
    FSM,
    IllegalOperationException,
    RequestContext,
    StateMachineConfig,
    Transitions,
    validateTransitionDefinition,
} from '../../../common';
import { mergeTransitionDefinitions } from '../../../common/finite-state-machine/merge-transition-definitions';
import { Logger } from '../../../config';
import { ConfigService } from '../../../config/config.service';
import { JobPost } from '../../../entity';
import { JobPostState, JobPostTransitionData } from './job-post-state';

@Injectable()
export class JobPostStateMachine {
    readonly config: StateMachineConfig<JobPostState, JobPostTransitionData>;
    private readonly initialState: JobPostState = 'DRAFT';

    constructor(private configService: ConfigService) {
        this.config = this.initConfig();
    }

    getInitialState(): JobPostState {
        return this.initialState;
    }

    canTransition(currentState: JobPostState, newState: JobPostState): boolean {
        return new FSM(this.config, currentState).canTransitionTo(newState);
    }

    getNextStates(jobPost: JobPost): readonly JobPostState[] {
        const fsm = new FSM(this.config, jobPost.state);
        return fsm.getNextStates();
    }

    async transition(ctx: RequestContext, jobPost: JobPost, state: JobPostState) {
        const fsm = new FSM(this.config, jobPost.state);
        const result = await fsm.transitionTo(state, { ctx, jobPost });
        jobPost.state = fsm.currentState;
        return result;
    }

    private initConfig(): StateMachineConfig<JobPostState, JobPostTransitionData> {
        const jobPostProcesses = this.configService.jobPostOptions.process ?? [];

        const allTransitions = jobPostProcesses.reduce(
            (transitions, process) => mergeTransitionDefinitions(transitions, process.transitions as Transitions<any>),
            {} as Transitions<JobPostState>,
        );

        const validationResult = validateTransitionDefinition(allTransitions, this.initialState);
        if (!validationResult.valid && validationResult.error) {
            Logger.error(`The job post process has an invalid configuration:`);
            throw new Error(validationResult.error);
        }
        if (validationResult.valid && validationResult.error) {
            Logger.warn(`Job post process: ${validationResult.error}`);
        }
        return {
            transitions: allTransitions,
            onTransitionStart: async (fromState, toState, data) => {
                for (const process of jobPostProcesses) {
                    if (typeof process.onTransitionStart === 'function') {
                        const result = await awaitPromiseOrObservable(
                            process.onTransitionStart(fromState, toState, data),
                        );
                        if (result === false || typeof result === 'string') {
                            return result;
                        }
                    }
                }
            },
            onTransitionEnd: async (fromState, toState, data) => {
                for (const process of jobPostProcesses) {
                    if (typeof process.onTransitionEnd === 'function') {
                        await awaitPromiseOrObservable(process.onTransitionEnd(fromState, toState, data));
                    }
                }
            },
            onError: async (fromState, toState, message) => {
                for (const process of jobPostProcesses) {
                    if (typeof process.onTransitionError === 'function') {
                        await awaitPromiseOrObservable(process.onTransitionError(fromState, toState, message));
                    }
                }
                throw new IllegalOperationException(message || 'message.cannot-transition-job-post-from-to', {
                    fromState,
                    toState,
                });
            },
        };
    }
}
