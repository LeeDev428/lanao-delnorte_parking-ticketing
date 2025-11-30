import axios from 'axios';

// Configure Axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Function to initialize CSRF token
const initializeCsrf = async () => {
    try {
        // First, try to get CSRF from meta tag (works on initial page load)
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
            console.log('CSRF token set from meta tag');
        } else {
            console.warn('CSRF token not found in meta tag');
        }
        
        // Also fetch the CSRF cookie to ensure session is initialized
        // This is especially important for mobile apps
        await axios.get('/sanctum/csrf-cookie');
        console.log('CSRF cookie fetched successfully');
    } catch (error) {
        console.error('Failed to initialize CSRF:', error);
    }
};

// Initialize CSRF on load
initializeCsrf();

export default axios;
