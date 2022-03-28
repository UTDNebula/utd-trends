import {createContext, Dispatch, PropsWithChildren, SetStateAction, useState} from 'react';

interface Film {
    title: string;
    year: number;
}

// Method to create a context for a specific value
function createCtx<A>(defaultValue: A) {
    type UpdateType = Dispatch<
        SetStateAction<typeof defaultValue>
        >;
    const defaultUpdate: UpdateType = () => defaultValue;
    const ctx = createContext({
        state: defaultValue,
        update: defaultUpdate,
    });
    function Provider(props: PropsWithChildren<{}>) {
        const [state, update] = useState(defaultValue);
        return <ctx.Provider value={{ state, update }} {...props} />;
    }
    return [ctx, Provider] as const; // alternatively, [typeof ctx, typeof Provider]
}

// Create context for the search terms, so that the search grid and carousel can both access this data
const [searchTermsContext, SearchTermsProvider] = createCtx<Film[]>([]);

export const SearchTermsContext = searchTermsContext;

export function DashboardWrapper({children}:{children:React.ReactNode}) {
    return (
        <SearchTermsProvider>
            {children}
        </SearchTermsProvider>
    );
}
