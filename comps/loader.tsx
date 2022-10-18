import ReactLoading from 'react-loading';


export function Loader({color}: {color?: string}) {
    return (
        <div className="loader mb-4 mt-3">
            <ReactLoading type={'bubbles'} color={color ? color : 'rgb(159 159 159)'}
                          width={'50px'}/>
        </div>
    );
}
