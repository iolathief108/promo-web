import {proxy} from 'valtio';

interface Interface {
    isAdmin?: boolean;
    isAdminLoading: boolean
}

const configState = proxy<Interface>({
    isAdmin: false,
    isAdminLoading: true,
});

export default configState;
