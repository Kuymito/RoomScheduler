// /app/auth/action.jsx
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const LOGIN_API_URL = process.env.LOGIN_API_URL || 'http://localhost:8080/api/v1/auth/login';

// Helper function to decode the JWT payload
function parseJwt(token) {
    try {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
}

// ✅ CORRECTED AND RESTRUCTURED SERVER ACTION
export async function loginAction(previousState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return { message: 'Please enter both email and password.' };
    }

    let apiResponse;
    try {
        // The try block now ONLY handles the network request
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        apiResponse = await response.json();

        if (!response.ok) {
            return { message: apiResponse.message || 'Login failed. Please check your credentials.' };
        }
    } catch (error) {
        console.error('Login action fetch error:', error);
        return { message: 'Could not connect to the authentication service. Please try again later.' };
    }

    // --- Logic now continues outside the try...catch block ---

    const token = apiResponse.payload?.token || apiResponse.token;

    if (!token) {
        return { message: 'Login successful, but no token was received.' };
    }

    // Decode the token to check for roles
    const decodedToken = parseJwt(token);

    if (decodedToken && decodedToken.roles) {
        // Set the secure, httpOnly cookie
        cookies().set('jwtToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        // Now, call redirect(). This will correctly terminate the action and navigate the user.
        if (decodedToken.roles.includes('ROLE_ADMIN')) {
            redirect('/admin/dashboard');
        } else if (decodedToken.roles.includes('ROLE_INSTRUCTOR')) {
            redirect('/instructor/dashboard');
        } else {
            redirect('/'); // Fallback redirect
        }
    } else {
        return { message: 'Invalid token received from the server.' };
    }
}