import React, { FC } from 'react';
import { withRouter } from 'react-router';
import fetchData from '../fetchData';
import InputField from './InputField';

const Signin: FC<any> = (props) => {
    const signIn: (e: React.SyntheticEvent) => void = async (e) => {
        e.preventDefault();
        const { socket } = props;
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
                    payload {
                        id
                    }
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
            alert(`Sign in is failed. Server message: ${message}`);
        }
    }

    return (
        <div className="sign-in-wrap auth">
            <h2>Sign in:</h2>
            <form
                className="signin auth-form"
                onSubmit={signIn}
            >
                <InputField
                    inputName="name"
                    label="Username or email"
                />
                <InputField
                    inputName="password"
                    label="Your password"
                />
                <button className="sign-in submit-button" type="submit">Sign in</button>
            </form>
        </div>
    )
}

export default withRouter(Signin);
