import {proxy} from 'valtio';



interface Interface {
    isCheckoutPage: boolean
}

const pageState = proxy<Interface>({
    isCheckoutPage: false
})

export default pageState;
