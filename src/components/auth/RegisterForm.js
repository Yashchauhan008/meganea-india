import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';

const RegisterForm = () => {
    // State now includes all fields required by the backend
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        contactNumber: '',
        role: 'india-staff', // Default role
        location: 'India',   // Default location
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // The formData object now perfectly matches the backend's expectations
            await registerUser(formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            // This will now display the specific error from the backend (e.g., "User already exists")
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-foreground dark:bg-dark-foreground rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-text dark:text-dark-text">Create an Account</h2>
            {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            {success && <p className="text-center text-green-500 bg-green-100 p-3 rounded-md">{success}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" required value={formData.username} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input id="contactNumber" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required minLength="6" value={formData.password} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select id="role" name="role" value={formData.role} onChange={handleChange}>
                            <option value="india-staff">India Staff</option>
                            <option value="admin">Admin</option>
                            <option value="labor">Labor</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <Select id="location" name="location" value={formData.location} onChange={handleChange}>
                            <option value="India">India</option>
                            {/* Admin might need to create a Dubai user, so we can keep the option */}
                            <option value="Dubai">Dubai</option>
                        </Select>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-2 px-4 text-white bg-primary rounded-md disabled:opacity-50">
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary hover:underline">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterForm;
