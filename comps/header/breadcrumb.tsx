import frontState from '../../states/front';
import {useSnapshot} from 'valtio';


interface Props {
    noRes?: boolean;
    forceClose?: boolean;
    black?: boolean;
}

export function Breadcrumb(props: Props) {
    const {isSidebarActive} = useSnapshot(frontState);
    return (
        <div onClick={
            () => {
                if (frontState.isSidebarActive) {
                    frontState.isSidebarActive = false;
                } else {
                    frontState.isSidebarActive = true;
                }
            }
        } className={`breadcrumb ${props.black ? 'black' : ''} ${(isSidebarActive && !props.noRes) || props.forceClose ? 'close' : ''}`}>
            <div className={'line'}/>
            <div className={'line'}/>
            <div className={'line'}/>
        </div>
    );
}
