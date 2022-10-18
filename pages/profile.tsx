import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {useEffect, useState} from 'react';
import frontState from '../states/front';
import {Category} from '@prisma/client';
import {proxy, useSnapshot} from 'valtio';
import profileState, {profileActions} from '../states/profile';
import {Fetcher} from '../lib/fetcher';
import Router from 'next/router';
import {Cats} from '../comps/cats/cats';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import {formatPhoneNumber, useHasHydrated} from '../lib/utils';
import {Container} from '../comps/container';
import Head from 'next/head';


type Props = {
    categories: Category[];
}


interface LoginState {
    otpSent: boolean;
    otp: string;
    phone: string;
    firstName: string;
    lastName: string;
    isLoading: boolean;
    error: string;
    profileUpdated: boolean;
    uiLoading: boolean;
}

const state = proxy<LoginState>({
    otpSent: false,
    otp: '',
    phone: '',
    firstName: '',
    lastName: '',
    isLoading: false,
    error: '',
    profileUpdated: false,
    uiLoading: true,
});


const Profile: NextPage<Props> = () => {

    const {firstName, lastName, phone, otp, otpSent, profileUpdated, uiLoading} = useSnapshot(state);
    const [editPhone, setEditPhone] = useState(false);
    const profileState1 = useSnapshot(profileState);
    const {searchContainerMargin, windowWidth} = useSnapshot(frontState);

    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    useEffect(() => {
        if (state.profileUpdated) {
            state.profileUpdated = false;
        }
    }, [firstName, lastName]);

    useEffect(() => {

        // initialize state
        state.firstName = profileState.firstName || '';
        state.lastName = profileState.lastName || '';
        state.phone = profileState.phone || '';
        state.uiLoading = false;
    }, [profileState1]);

    useEffect(() => {
        // initialize category

        profileActions.refresh().then(() => {
            state.uiLoading = false;
        }).catch(() => {
            state.uiLoading = false;
        });
    }, []);

    const onProfileUpdate = (e: any) => {
        e.preventDefault();

        Fetcher.post('/user/profile', {
            firstName,
            lastName,
        }).then(res => {
            if (res.status === 200) {
                // update profile state
                profileState.firstName = firstName;
                profileState.lastName = lastName;
                state.profileUpdated = true;

            } else {
                alert('Invalid OTP');
            }
        }).catch(err => {
            console.log(err);
        });
    };

    const onSendOtp = (e: any) => {
        e.preventDefault();

        if (phone.length === 0 || phone === profileState.phone) {
            setEditPhone(false);
            return;
        }

        state.isLoading = true;
        Fetcher.post('/login/otp', {
            phone,
            key: 'send_otp',
        }).then(res => {
            if (res.status === 200) {
                state.otpSent = true;
                state.phone = e.currentTarget.phone.value;
            } else {
                state.error = 'Invalid phone number';
            }
        }).catch(() => {
            state.error = 'Error';
        }).finally(() => {
            state.isLoading = false;
        });
        state.otpSent = true;
    };

    const onUpdatePhone = (e: any) => {
        e.preventDefault();
        Fetcher.post('/user/profile', {
            phone,
            otp,
        }).then(res => {
            if (res.status === 200) {
                // update profile state
                profileState.phone = phone;
                // edit phone
                setEditPhone(false);
            } else {
                alert('Invalid OTP');
            }
        }).catch(err => {
            console.log(err);
        });
    };

    const onLogout = (e: any) => {
        e.preventDefault();
        Fetcher.get('/user/logout', {}).then(res => {
            if (res.status === 200) {
                profileActions.reset();
                Router.push('/');
            }
        }).catch(err => {
            console.log(err);
        });
    };

    if (uiLoading) {
        return (
            <div>
                <Header/>
                <div className="container">
                </div>
            </div>
        );
    }

    if (!phone) {
        // redirect to login
        Router.push('/login');
        return (
            <div>
                <Header/>
                <div className="container">
                    <p>
                        You are not logged in.
                    </p>
                </div>
            </div>

        );
    }

    return (
        <>
            <Header/>
            <Head>
                <title>
                    Profile - NeatKitch
                </title>
            </Head>
            <Container className="container search">
                <Cats/>
                <div className={'mt-5'} style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <form onSubmit={onProfileUpdate}>
                        <h1>Profile</h1>
                        <label>First Name: <input type="text" value={firstName}
                                                  onChange={(e) => state.firstName = e.target.value}/></label>
                        <br/>
                        <label>Last Name: <input type="text" value={lastName}
                                                 onChange={(e) => state.lastName = e.target.value}/></label>
                        <br/>
                        {
                            profileUpdated &&
                            <div className="alert alert-success">Profile updated</div>
                        }
                        <input type="submit" value="Submit"/>
                    </form>
                    <h3 className={'mt-4 fw-semibold'}>Phone</h3>
                    {
                        editPhone ? (
                            otpSent ? (
                                <div>
                                    <p>OTP sent to your Phone</p>
                                    <form onSubmit={onUpdatePhone}>
                                        <div className="form-group">
                                            {/*<label htmlFor="otp">OTP</label>*/}
                                            <input type="text" id="otp" placeholder="Your OTP Here" value={otp}
                                                   onChange={e => state.otp = e.target.value}/>
                                            <input type="submit" value="Submit"/>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div>
                                    <p>Enter your phone</p>
                                    <form onSubmit={onSendOtp}>
                                        <div className="form-group">
                                            {/*<label htmlFor="phone">Phone</label>*/}
                                            <input type="text" id="phone" placeholder="Phone" value={phone}
                                                   onChange={e => state.phone = e.target.value}/>
                                            <input type="submit" value="Submit"/>
                                        </div>
                                    </form>
                                </div>
                            )
                        ) : (
                            <div>
                                {formatPhoneNumber(phone)}
                                <button className={'ms-3 blue-btn'} onClick={() => setEditPhone(true)}>Edit</button>
                            </div>
                        )
                    }
                    <form onSubmit={onLogout} className={'mt-4 '}>
                        <input className={'red-btn'} type="submit" value="Logout"/>
                    </form>
                </div>
            </Container>
            <Background withMargin align={'right'} bg={'/static/images/right-bg.jpg'}/>

            {
                windowWidth > 1200 &&
                <>
                    <Banner align={'left'} bannerLarge={bannerA}/>
                    <Banner align={'right'}
                            bannerTop={bannerB}
                            bannerBottom={bannerC}/>
                </>
            }
        </>
    );
};

export default Profile;

