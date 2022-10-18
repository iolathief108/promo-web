import {Header} from '../comps/header/header';
import type {NextPage} from 'next';
import {proxy, useSnapshot} from 'valtio';
import {Fetcher} from '../lib/fetcher';
import Router from 'next/router';
import React, {useEffect, useState} from 'react';
import {profileActions} from '../states/profile';
import {Container} from '../comps/container';
import {getStdPhone, useHasHydrated} from '../lib/utils';
import frontState from '../states/front';
import {Cats} from '../comps/cats/cats';
import {Banner} from '../comps/banner';
import {Background} from '../comps/background';
import Head from 'next/head';


interface LoginState {
    otpSent: boolean;
    otp: string;
    phone: string;
    isLoading: boolean;
    error: string;
}

const state = proxy<LoginState>({
    otpSent: false,
    otp: '',
    phone: '',
    isLoading: false,
    error: '',
});

const Login: NextPage = () => {

    const {otpSent, phone, otp, isLoading, error} = useSnapshot(state);

    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const {searchContainerMargin} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();
    const [otpTimer, setOtpTimer] = useState(0);

    useEffect(() => {

        // if logged in, redirect to home
        Fetcher.get<{user: boolean}>('/user/login').then((res) => {
            if (res.data?.user) {
                Router.push('/');
            }
        }).catch(e => {
            if (typeof window !== 'undefined') {
                console.log(e);
            }
        });
        return () => {
            // reset login state
            state.otpSent = false;
            state.otp = '';
            state.phone = '';
            state.isLoading = false;
            state.error = '';
        }

    }, []);

    const runTimer = () => {
        let timer = otpTimer;
        if (otpTimer === 0) {
            setOtpTimer(60);
            timer = 60;
        }
        // decrement timer
        const inf = setInterval(() => {

            setOtpTimer(timer - 1);
            timer = timer - 1;

            if (timer  === 0) {
                clearInterval(inf);
            }
        }, 1000);
    };

    const onLogin = (e: React.FormEvent<HTMLFormElement>) => {
        // send login request
        e.preventDefault();
        state.error = '';

        Fetcher.post('/user/login', {
            phone: getStdPhone(phone),
            otp,
        }).then(res => {
            if (res.status === 200) {
                profileActions.refresh();
                Router.push('/');
                // redirect to home
                // window.location.href = '/';
            } else {
                alert('Invalid OTP');
            }
        }).catch(err => {
            if (err.response?.data?.error) {
                state.error = err.response.data.error;
            } else {
                state.error = 'Unknown error';
            }
        });
    };

    const onSendOTP = (e: React.FormEvent<HTMLFormElement>) => {
        // send otp
        e.preventDefault();
        state.error = '';
        runTimer();
        state.isLoading = true;
        Fetcher.post('/login/otp', {
            phone: getStdPhone(phone),
            key: 'send_otp',
        }).then(res => {
            if (res.status === 200) {
                state.otpSent = true;
            } else {
                state.error = 'Invalid phone number';
            }
        }).catch(err => {

            if (err.response?.data?.error) {
                state.error = err.response.data.error;
            } else {
                state.error = 'Sorry, we are having trouble sending you an OTP';
            }

        }).finally(() => {
            state.isLoading = false;
        });
    };

    const resendOTP = () => {
        // send otp
        state.isLoading = true;
        state.error = '';

        runTimer();

        Fetcher.post('/login/otp', {
            phone: getStdPhone(phone),
            key: 'send_otp',
        }).then(res => {
            if (res.status === 200) {
                state.otpSent = true;
            } else {
                state.error = 'Invalid phone number';
            }
        }).catch(err => {
            if (err.response?.data?.error) {
                state.error = err.response.data.error;
            } else {
                state.error = 'Sorry, we are having trouble sending you an OTP';
            }

        }).finally(() => {
            state.isLoading = false;
        });
    };

    return (
        <>
            <Header/>
            <Head>
                <title>
                    Login - NeatKitch
                </title>
            </Head>
            <Container className="container search pb-4 text-center">
                <Cats/>
                <div className={'clearfix'} style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <h1 className={'pt-5'}>Login</h1>
                    <div>
                        {otpSent ? (
                            <div>
                                <p>Enter OTP sent to Your Phone</p>
                                <form onSubmit={onLogin}>
                                    <div className="form-group">
                                        <input type="text" id="otp" placeholder="OTP" value={otp}
                                               onChange={e => state.otp = e.target.value}/>
                                        <input className={'px-3'} type="submit" value="Login"/>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div>
                                <p>Enter phone number to send OTP</p>
                                <form onSubmit={onSendOTP}>
                                    <div className="form-group">
                                        {/*<label htmlFor="phone">Phone</label>*/}
                                        {/*<br/>*/}
                                        <input type="text" id="phone" placeholder="+65xxxxxxxx" value={phone}
                                               onChange={e => state.phone = e.target.value}/>
                                        <input type="submit" value="Send OTP"/>
                                    </div>
                                </form>
                            </div>
                        )}
                        {otpSent && (
                            <div className={'mt-3'}>
                                <button onClick={() => state.otpSent = false}>
                                    <i className="fa fa-arrow-left opacity-75"/> Back
                                </button>
                                <button
                                    disabled={otpTimer > 0}
                                    onClick={resendOTP}>
                                    {
                                        otpTimer > 0 ? `Resend OTP in ${otpTimer}` : (<><i
                                            className="fa fa-refresh opacity-75"/> Resend OTP </>)
                                    }

                                </button>
                            </div>
                        )
                        }
                        <div>
                            {error && <div className="fw-normal fs-6 text-danger mt-3"><i className="fa fa-exclamation-circle"/> {error}</div>}
                        </div>
                    </div>
                </div>

                <Background withMargin align={'right'} bg={'/static/images/right-bg2.jpg'}/>
                <Banner align={'left'} bannerLarge={bannerA}/>
                <Banner align={'right'}
                        bannerTop={bannerB}
                        bannerBottom={bannerC}/>
            </Container>
        </>
    );
};


export default Login;

