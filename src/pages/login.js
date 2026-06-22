// ==================== Login & Guest Mode Page ====================
// Shown as the absolute first screen for all users
// Option A: Sign in with Google
// Option B: Explore as Guest

import { loginWithGoogle } from '../components/sidebar.js';
import { auth } from '../services/firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { showToast } from '../components/toast.js';

export function renderLoginPage(container) {
    // Hide sidebar on the login page exclusively
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('hamburger-btn');
    if (sidebar) sidebar.style.display = 'none';
    if (toggleBtn) toggleBtn.style.display = 'none';
    
    // Expand page content full width since sidebar is hidden
    container.style.marginLeft = '0';
    container.style.width = '100%';
    container.style.maxWidth = '100%';

    container.innerHTML = `
    <div class="login-page-wrapper">
        <div class="login-card card" style="position:relative;">
            <a href="#/" class="modal-close" style="position:absolute; top: 16px; right: 16px; text-decoration:none; display:flex; align-items:center; justify-content:center; color: var(--text-secondary);">&times;</a>
            <div class="login-logo">
                <div class="sidebar-logo-icon" style="width:48px;height:48px;font-size:24px;">✦</div>
                <h1 style="font-family:var(--font-heading);font-weight:800;font-size:2rem;margin-top:12px">Crealix AI</h1>
                <p style="color:var(--text-secondary);font-size:var(--fs-sm);margin-top:4px">Your AI Social Media Studio</p>
            </div>

            <div class="login-options" id="login-primary-options">
                <button class="btn btn-primary login-btn-google" id="login-google-primary">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                </button>



                <button class="btn btn-secondary mt-sm" id="login-email-btn" style="width:100%; display:flex; align-items:center; justify-content:center; gap: 8px;">
                    Continue with Email
                </button>

                <div class="login-divider">
                    <span>or</span>
                </div>

                <a href="#/" class="btn btn-secondary login-btn-guest" id="login-guest-btn" style="text-decoration:none; display:flex; align-items:center; justify-content:center;">
                    Return to Home Page <span>→</span>
                </a>

                <div style="text-align:center; margin-top:24px;">
                    <button type="button" id="primary-signup-btn" style="background:none;border:none;color:var(--text-secondary); font-size:14px; text-decoration:none; cursor:pointer; font-family: inherit;">Don't have an account? <span style="color:var(--primary-color); font-weight:600;">Sign Up</span></button>
                </div>
            </div>


            <!-- Hidden Email Input Form -->
            <form id="login-email-form" style="display:none; text-align:left;">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" placeholder="you@example.com" id="email-input" autocomplete="username" style="width:100%; margin-bottom: 16px;" required>
                
                <label class="form-label mt-sm">Password</label>
                <input type="password" class="form-input" placeholder="••••••••" id="password-input" autocomplete="current-password" style="width:100%; margin-bottom: 24px;" required>
                
                <div id="confirm-password-group" style="display:none;">
                    <label class="form-label mt-sm">Confirm Password</label>
                    <input type="password" class="form-input" placeholder="••••••••" id="confirm-password-input" autocomplete="new-password" style="width:100%; margin-bottom: 24px;">
                </div>
                
                <button type="submit" class="btn btn-primary" id="email-submit-btn" style="width:100%;">Sign In</button>
                <div style="text-align:center; margin-top:12px;">
                    <button type="button" id="toggle-email-mode" style="background:none;border:none;color:var(--text-secondary); font-size:14px; text-decoration:none; cursor:pointer;">Don't have an account? <span style="color:var(--primary-color)">Sign Up</span></button>
                </div>
                <button type="button" class="btn btn-secondary mt-sm" id="back-from-email" style="width:100%;">← Back</button>
            </form>

            <p class="login-terms">
                By continuing, you agree to our Terms of Service & Privacy Policy.
            </p>
        </div>
    </div>`;



    document.getElementById('login-google-primary')?.addEventListener('click', () => {
        loginWithGoogle().then(() => {
            // After successful login, router will naturally pick up auth state and redirect
        });
    });

    let isEmailSignUp = false;

    document.getElementById('login-email-btn')?.addEventListener('click', () => {
        document.getElementById('login-primary-options').style.display = 'none';
        document.getElementById('login-email-form').style.display = 'block';
        
        // Force to Sign In mode
        isEmailSignUp = false;
        document.getElementById('email-submit-btn').textContent = 'Sign In';
        document.getElementById('password-input').autocomplete = 'current-password';
        document.getElementById('confirm-password-group').style.display = 'none';
        const confirmInput = document.getElementById('confirm-password-input');
        if (confirmInput) confirmInput.required = false;
        
        const toggleBtn = document.getElementById('toggle-email-mode');
        if(toggleBtn) toggleBtn.innerHTML = "Don't have an account? <span style='color:var(--primary-color)'>Sign Up</span>";
    });

    document.getElementById('primary-signup-btn')?.addEventListener('click', () => {
        document.getElementById('login-primary-options').style.display = 'none';
        document.getElementById('login-email-form').style.display = 'block';
        
        // Force to Sign Up mode
        isEmailSignUp = true;
        document.getElementById('email-submit-btn').textContent = 'Create Account';
        document.getElementById('password-input').autocomplete = 'new-password';
        document.getElementById('confirm-password-group').style.display = 'block';
        const confirmInput = document.getElementById('confirm-password-input');
        if (confirmInput) confirmInput.required = true;
        
        const toggleBtn = document.getElementById('toggle-email-mode');
        if(toggleBtn) toggleBtn.innerHTML = 'Already have an account? <span style="color:var(--primary-color)">Sign In</span>';
    });

    document.getElementById('back-from-email')?.addEventListener('click', () => {
        document.getElementById('login-email-form').style.display = 'none';
        document.getElementById('login-primary-options').style.display = 'block';
    });

    document.getElementById('toggle-email-mode')?.addEventListener('click', (e) => {
        e.preventDefault();
        isEmailSignUp = !isEmailSignUp;
        document.getElementById('email-submit-btn').textContent = isEmailSignUp ? 'Create Account' : 'Sign In';
        document.getElementById('password-input').autocomplete = isEmailSignUp ? 'new-password' : 'current-password';
        document.getElementById('confirm-password-group').style.display = isEmailSignUp ? 'block' : 'none';
        
        const confirmInput = document.getElementById('confirm-password-input');
        if (confirmInput) confirmInput.required = isEmailSignUp;
        
        e.currentTarget.innerHTML = isEmailSignUp 
            ? 'Already have an account? <span style="color:var(--primary-color)">Sign In</span>' 
            : "Don't have an account? <span style='color:var(--primary-color)'>Sign Up</span>";
    });

    document.getElementById('login-email-form')?.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload but allow browser to capture password
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;
        
        if (isEmailSignUp) {
            const confirm = document.getElementById('confirm-password-input').value;
            if (password !== confirm) {
                showToast('Passwords do not match', 'error');
                return;
            }
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    sendEmailVerification(userCredential.user).then(() => {
                        showToast('Account created! Please check your email to verify.', 'success');
                    });
                })
                .catch((error) => showToast('Failed to create account: ' + error.message, 'error'));
        } else {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    if (!userCredential.user.emailVerified) {
                        showToast('Please verify your email before using all features.', 'warning');
                    } else {
                        showToast('Signed in successfully!', 'success');
                    }
                })
                .catch((error) => showToast('Failed to sign in: ' + error.message, 'error'));
        }
    });

    document.getElementById('login-guest-btn')?.addEventListener('click', () => {
        // Set guest session flag
        sessionStorage.setItem('biospark_guest', 'true');
        window.location.hash = '#/'; // Go to main landing page to view plans & demos
    });
}

// Helper to cleanup any main layout overrides when navigating away from login
export function cleanupLoginLayout(container) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('hamburger-btn');
    if (sidebar) sidebar.style.display = '';
    if (toggleBtn) toggleBtn.style.display = '';
    
    // Reset layout styles
    container.style.marginLeft = '';
    container.style.width = '';
    container.style.maxWidth = '';
}
