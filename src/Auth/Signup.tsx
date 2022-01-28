import React, { FC } from 'react';
import { withRouter } from 'react-router';
import fetchData from '../fetchData';
import InputField from './InputField';

interface ValueString {
    value: string;
}

const Signup: FC<any> = (props) => {
    const signUp: (e: React.SyntheticEvent) => void = async (e) => {
        e.preventDefault();
        const { socket } = props;
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
                    payload {

                    }
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
                success,
                payload
            }
        } = await fetchData(query, vars);

        if (success) {
            localStorage.setItem('token', message);
            props.history.push('/');
            socket.emit('user connection', {
                name: vars.user.name,
                id: payload.id
            });
        } else {
            alert(`Sign up is failed. Server message: ${message}`);
        }
    }

    return (
        <div className="sign-up-wrap auth">
            <h2>Sign up:</h2>
            <form
                className="signup auth-form"
                name="signup"
                onSubmit={signUp}
            >
                <InputField
                    inputName="name"
                    label="Username"
                />
                <InputField
                    inputName="email"
                    label="Email"
                />
                <InputField
                    inputName="password"
                    label="Password"
                />
                <InputField
                    inputName="repeatedPassword"
                    label="Repeat the password"
                />
                <button
                    className="sign-up submit-button"
                    type="submit"
                >
                    Sign up
                </button>
            </form>
        </div>
    )
}

export default withRouter(Signup);
