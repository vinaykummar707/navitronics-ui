import { createCrudHooks } from "@/hooks/useCrud";

export interface ITextConfig {
    id: string;
    code: string;
    name: string;
    config: string;
    created_at: string;
}

export interface ITextConfigCreate {
    code: string;
    name: string;
    config: {
        sideText: ITextProperties,
        text: ITextProperties,
        upperHalfText: ITextProperties,
        lowerHalfText: ITextProperties,
        routeNumber1: ITextProperties,
        routeNumber2: ITextProperties
    }
}

export interface ITextProperties {
    fontHeight: string,
    fontFamily16: string,
    fontFamily32: string,
    fontFamily8: string
}

export const texts = ['sideText', 'text', 'upperHalfText', 'lowerHalfText', 'routeNumber1', 'routeNumber2'] as const;




export const defaultTextConfig: ITextConfigCreate = {
    code: '',
    name: '',

    config: {
        sideText: {
            fontHeight: '',
            fontFamily16: '',

            fontFamily32: '',
            fontFamily8: ''
        },
        text: {
            fontHeight: '',
            fontFamily16: '',
            fontFamily32: '',
            fontFamily8: ''
        },
        upperHalfText: {
            fontHeight: '',
            fontFamily16: '',
            fontFamily32: '',
            fontFamily8: ''
        },
        lowerHalfText: {
            fontHeight: '',
            fontFamily16: '',
            fontFamily32: '',
            fontFamily8: ''
        },
        routeNumber1: {
            fontHeight: '',
            fontFamily16: '',
            fontFamily32: '',
            fontFamily8: ''
        },
        routeNumber2: {
            fontHeight: '',
            fontFamily16: '',
            fontFamily32: '',
            fontFamily8: ''
        }
    }
};

// Update: id required, rest optional (except created_at)
export type ITextConfigUpdate = Pick<ITextConfig, 'id'> & Partial<Omit<ITextConfig, 'id' | 'created_at'>>;

// Delete and Get: only id
export type ITextConfigDelete = Pick<ITextConfig, 'id'>;
export type ITextConfigGet = Pick<ITextConfig, 'id'>;

// Create the hooks for 'font_settings' table
export const fontSettingsCrud = createCrudHooks<ITextConfig, ITextConfigCreate, ITextConfigUpdate>('font_settings');