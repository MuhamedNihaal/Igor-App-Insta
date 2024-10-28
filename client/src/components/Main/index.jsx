import React, { useState, useEffect } from 'react';
import { BellRing, Home, Calendar, List, LogOut, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import IgorLogo from '../../assets/IgorLogo.png';
import wallpaper from '../../assets/wallpaper.png'

const Dashboard = () => {
    const [comments, setComments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch comments from your backend
    useEffect(() => {
        // TODO: Implement actual API call
        const fetchComments = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/comments');
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
        // Set up polling every 30 seconds
        const interval = setInterval(fetchComments, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-100 min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${wallpaper})` }}>
            {/* Sidebar */}
            <div
                className="w-64 shadow-lg">
                {/* Logo */}
                <div className="p-4 border-b-4 border-gray-500">
                    <img
                        src={IgorLogo}
                        alt="Igor App"
                        className="h-12"
                    />
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-red-500 to-pink-500 text-transparent bg-clip-text drop-shadow-md mb-4">
                        Instagram Comments Management
                    </h2>

                </div>

                {/* Navigation */}
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link to="/about" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                <Home className="w-5 h-5 mr-3" />
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/management" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                <BellRing className="w-5 h-5 mr-3" />
                                Management
                            </Link>
                        </li>
                        <li>
                            <Link to="/documentation" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                <List className="w-5 h-5 mr-3" />
                                Documentation
                            </Link>
                        </li>
                        <li>
                            <Link to="/schedules" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                                <Calendar className="w-5 h-5 mr-3" />
                                Schedules
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-16 w-64 p-4 border-t-4 border-gray-500">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-700">A</span>
                        </div>
                        <div className="ml-3">
                            <p className="font-medium text-gray-800">Admin</p>
                            <p className="text-sm text-gray-500">admin@bhoomika.com</p>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="absolute bottom-0 w-64 p-4 border-t-4 border-gray-500">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Total Number of Enquiry: {comments.length}
                        </h1>
                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Search by Name"
                                className="px-4 py-2 border rounded-lg mr-4"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <span className="sr-only">Delete</span>
                                🗑️
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Full Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Received Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comment
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {comments.map((comment, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{comment.fullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{comment.phoneNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{comment.receivedDate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{comment.gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{comment.preferredLocation}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{comment.sizeOfPlot}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                to={`/reply/${comment.id}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;