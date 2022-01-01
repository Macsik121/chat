import React, { FC } from 'react';
import { withRouter } from 'react-router';
import fetchData from '../fetchData';

const Signin: FC<any> = (props) => {
    const signIn: (e: React.SyntheticEvent) => void = async (e) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            name: { value: string },
            password: { value: string }
        };

        const { name, password } = target;
        const query = `
            query signIn($user: UserInput!) {
                signIn(user: $user) {
                    message
                    success
                }
            }
        `;
        const vars = {
            user: {
                name: name.value,
                password: password.value
            }
        };
        const {
            signIn: {
                message,
                success
            }
        } = await fetchData(query, vars);

        if (success) {
            localStorage.setItem('token', message);
            props.history.push('/');
        } else {
            console.log('Sign in is failed. Server message:', message)
        }
    }

    return (
        <div className="sign-in-wrap">
            <h2>Sign in:</h2>
            <form
                className="signin"
                onSubmit={signIn}
            >
                <div className="field-wrap">
                    <input type="text" name="name" className="field" />
                    <label>Username or email:</label>
                </div>
                <div className="field-wrap">
                    <input type="text" name="password" className="field" />
                    <label>Your password:</label>
                </div>
                <button className="sign-in" type="submit">Sign in</button>
            </form>
        </div>
    )
}

export default withRouter(Signin);
