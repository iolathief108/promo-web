import type {NextPage} from 'next';
import {Fetcher} from '../../lib/fetcher';
import Router from 'next/router';
import React, {useEffect} from 'react';
import configState from '../../states/config';



const Login: NextPage = () => {

    useEffect(() => {
        if (configState.isAdmin) {
            Router.push('/admin/products');
        }
    })

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        Fetcher.post('/admin/login', {
          password: e.currentTarget.password.value,
        }).then(res => {
            if (res.status === 200) {
                Router.push('/admin/');
            } else {
                alert('Invalid password');
            }
        }).catch(err => {
            console.log(err);
        })
    }

    return (
        <>
            <div className="container mt-5">
                <h1 className={'text-center'}>Login</h1>
                <form  onSubmit={onSubmit}>
                    <div className="form-group text-center">
                        {/*<label htmlFor="password">Password</label>*/}
                        <br/>
                        <input type="password" id="password" placeholder="Admin Password"/>
                        <br/>
                        <input type="submit" value="Login"/>
                        <br/>
                        <small id="emailHelp" className="form-text text-muted">
                            We&apos;ll never share your email with anyone else.
                        </small>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Login;
