import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface FlowState {
    currentRoute: string;
    context?: {
        name: string;
        email: string;
        professionalTitle: string;
        location: string;
    };
    traits?: {
        answers: number[];
        questions: any[];
    };
    attitudes?: {
        answers: number[];
        questions: any[];
    };
    focus?: {
        focusAreaId: string;
        personalityContext: {
            traits: Array<{
                id: string;
                name: string;
                description: string;
                value: number;
            }>;
            attitudes: Array<{
                id: string;
                name: string;
                description: string;
                value: number;
            }>;
        };
        professionalContext: {
            title?: string;
            location?: string;
        };
    };
    rounds?: {
        round1?: {
            response: string;
            evaluation?: any;
        };
        round2?: {
            response: string;
            evaluation?: any;
        };
        round3?: {
            response: string;
            evaluation?: any;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class FlowService {
    private readonly FLOW_STATE_KEY = 'mereka_flow_state';

    constructor(private router: Router) { }

    saveFlowState(state: Partial<FlowState>): void {
        const currentState = this.getFlowState();
        const updatedState = { ...currentState, ...state };
        localStorage.setItem(this.FLOW_STATE_KEY, JSON.stringify(updatedState));
    }

    getFlowState(): FlowState {
        const state = localStorage.getItem(this.FLOW_STATE_KEY);
        return state ? JSON.parse(state) : {};
    }

    updateCurrentRoute(route: string): void {
        this.saveFlowState({ currentRoute: route });
    }

    getCurrentRoute(): string {
        const state = this.getFlowState();
        return state.currentRoute || '/context';
    }

    clearFlowState(): void {
        localStorage.removeItem(this.FLOW_STATE_KEY);
    }

    redirectToLastPosition(): void {
        const currentRoute = this.getCurrentRoute();
        this.router.navigate([currentRoute]);
    }

    isFlowComplete(): boolean {
        const state = this.getFlowState();
        return !!(state.rounds?.round3?.response);
    }
}
