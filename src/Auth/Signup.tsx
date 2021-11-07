import React, { FC } from 'react';
import { withRouter } from 'react-router';
import fetchData from '../fetchData';

interface ValueString {
    value: string;
}

const Signup: FC<any> = (props) => {
    const signUp: (e: React.SyntheticEvent) => void = async (e) => {
        e.preventDefault();
        const target = e.target as typeof e.target & {
            name: ValueString;
            email: ValueString;
            password: ValueString;
            repeatedPassword: ValueString;
        }

        let {
            name,
            email,
            password,
            repeatedPassword
        } = target;
        const query = `
            mutation signUp(
                $user: UserInput!
            ) {
                signUp(
                    user: $user
                ) {
                    message
                    success
                }
            }
        `;
        const vars = {
            user: {
                name: name.value,
                email: email.value,
                password: password.value
            }
        };
        const {
            signUp: {
                message,
                success
            }
        } = await fetchData(query, vars);
        if (success) {
            localStorage.setItem('token', message);
            props.history.push('/');
        } else {
            console.log('sign up is failed. Server message:', message);
        }
    }

    return (
        <div className="sign-up-wrap">
            <h2>Sign up:</h2>
            <form
                className="signup"
                name="signup"
                onSubmit={signUp}
            >
                <label className="error-message"></label>
                <div className="field-wrap">
                    <input type="text" name="name" className="field" />
                    <label>Username:</label>
                </div>
                <div className="field-wrap">
                    <input type="text" name="email" className="field" />
                    <label>Email:</label>
                </div>
                <div className="field-wrap">
                    <input type="text" name="password" className="field" />
                    <label>Password:</label>
                </div>
                <div className="field-wrap">
                    <input type="text" name="repeatedPassword" className="field" />
                    <label>Repeat the password:</label>
                </div>
                <button
                    className="sign-up"
                    type="submit"
                >
                    Sign up
                </button>
            </form>
        </div>
    )
}

export default withRouter(Signup);
