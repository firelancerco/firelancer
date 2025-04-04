import {
    InjectableStrategy,
    OnTransitionEndFn,
    OnTransitionErrorFn,
    OnTransitionStartFn,
    Transitions,
} from '../../../common';
import { JobPostState, JobPostStates, JobPostTransitionData } from '../../../service';

/**
 * @description
 * A JobPostProcess is used to define the way the job post process works as in: what states a JobPost can be
 * in, and how it may transition from one state to another. Using the `onTransitionStart()` hook, a JobPostProcess
 * can perform checks before allowing a state transition to occur, and the `onTransitionEnd()`
 * hook allows logic to be executed after a state change.
 *
 * For detailed description of the interface members, see the {@link StateMachineConfig} docs.
 *
 * :::info
 *
 * This is configured via the `jobPostOptions.process` property of your FirelancerConfig.
 *
 * :::
 */
export interface JobPostProcess<State extends keyof JobPostStates | string> extends InjectableStrategy {
    transitions?: Transitions<State, State | JobPostState> & Partial<Transitions<JobPostState | State>>;
    onTransitionStart?: OnTransitionStartFn<State | JobPostState, JobPostTransitionData>;
    onTransitionEnd?: OnTransitionEndFn<State | JobPostState, JobPostTransitionData>;
    onTransitionError?: OnTransitionErrorFn<State | JobPostState>;
}
