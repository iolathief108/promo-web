import {proxy} from 'valtio';
import {getProfile} from '../lib/fetcher';
import {useEffect, useState} from 'react';


interface IProfile {
    id?: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

const profileState = proxy<IProfile>({});

export default profileState;

export const profileActions = {
    refresh: async () => {
        // if server
        if (typeof window === 'undefined') {
            return;
        }
        const profile = await getProfile();
        if (profile) {
            profileState.id = profile.id;
            profileState.firstName = profile.firstName || undefined;
            profileState.lastName = profile.lastName || undefined;
            profileState.phone = profile.phone;
        } else {
            profileActions.reset();
        }
    },
    reset: () => {
        profileState.id = undefined;
        profileState.firstName = undefined;
        profileState.lastName = undefined;
        profileState.phone = undefined;
    },
};

export const useIsLoggedIn = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(!!profileState.phone || undefined);

    useEffect(() => {
        setIsLoggedIn(!!profileState.phone || undefined);
        profileActions.refresh().then(() => {
            setIsLoggedIn(typeof profileState.id === 'number');
        }).catch(() => {
            setIsLoggedIn(false);
        });
    }, []);
    return isLoggedIn;
};

(async () => {
    await profileActions.refresh();
})();
