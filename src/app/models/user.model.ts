import { TraitAnswer, TraitsData } from '../services/traits.service';
import { AttitudeAnswer, AttitudesData } from '../services/attitudes.service';

export interface UserContext {
    name: string;
    email: string;
    professionalTitle: string;
    location: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    professionalTitle: string;
    location: string;
    currentRoute: string;
    isAnonymous: boolean;
    authId: string | null;
    createdAt: any;
    updatedAt: any;
    traits?: TraitsData;
    attitudes?: AttitudesData;
    rounds?: {
        [key: string]: {
            comparison?: {
                differences?: string[];
                similarities?: string[];
            };
            decisions?: {
                [key: string]: any;
            };
            outcomes?: {
                [key: string]: any;
            };
        };
    };
}
