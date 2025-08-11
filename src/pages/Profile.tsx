import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfilePostsPerPage } from "../utils/userSettings";

interface UserPost {
    postId: number;
    content: string;
    createdAt: string;
    editedAt?: string;
    threadId: number;
    threadTitle: string;
    threadLocked: boolean;
    categoryId: number;
    categoryName: string;
    pageNumber: number;
    positionOnPage: number;
}

export default function Profile() {
    const { username } = useParams<{ username: string }>();
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [userPosts, setUserPosts] = useState<UserPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('forum');
    const [currentPostsPage, setCurrentPostsPage] = useState(0);
    const [totalPostsPages, setTotalPostsPages] = useState(0);
    const [totalPosts, setTotalPosts] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/users/${username}`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Profile not found");
                }

                const data = await response.json();
                setCreatedAt(data.createdAt);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserPosts = async (page = 0) => {
            if (!username) return;
            
            setPostsLoading(true);
            try {
                const pageSize = getProfilePostsPerPage();
                    
                const response = await fetch(`/api/users/${username}/posts?page=${page}&size=${pageSize}`, {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        // If it's just an array, we need to update backend to return pagination info
                        setUserPosts(data);
                        setTotalPosts(data.length);
                        setTotalPostsPages(data.length > 0 ? 1 : 0);
                    } else {
                        // If backend returns pagination info
                        setUserPosts(data.content || data.posts || data);
                        setTotalPosts(data.totalElements || 0);
                        setTotalPostsPages(data.totalPages || 0);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user posts:", err);
            } finally {
                setPostsLoading(false);
            }
        };

        if (username) {
            fetchProfile();
            fetchUserPosts(currentPostsPage);
        }
    }, [username, currentPostsPage]);

    const handlePostsPageChange = (page: number) => {
        setCurrentPostsPage(page);
    };

    const renderPagination = () => {
        if (totalPostsPages <= 1) return null;

        return (
            <div className="flex justify-center items-center gap-2 py-4">
                {currentPostsPage > 0 && (
                    <button
                        onClick={() => handlePostsPageChange(currentPostsPage - 1)}
                        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        disabled={postsLoading}
                    >
                        Previous
                    </button>
                )}
                
                {Array.from({ length: Math.min(5, totalPostsPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(totalPostsPages - 5, currentPostsPage - 2)) + i;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => handlePostsPageChange(pageNum)}
                            disabled={postsLoading}
                            className={`px-3 py-2 rounded transition-colors ${
                                pageNum === currentPostsPage
                                    ? 'bg-yellow-500 text-black font-medium'
                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                            } ${postsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {pageNum + 1}
                        </button>
                    );
                })}

                {currentPostsPage < totalPostsPages - 1 && (
                    <button
                        onClick={() => handlePostsPageChange(currentPostsPage + 1)}
                        className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        disabled={postsLoading}
                    >
                        Next
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white pt-24 px-6 flex justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white pt-24 px-6 flex justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 px-6 flex justify-center">
            <div className="w-full max-w-4xl bg-black bg-opacity-70 rounded-lg shadow-lg p-8 space-y-8">
                {/* Profile Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-yellow-400 mb-2">
                        {username}'s Profile
                    </h1>
                    <p className="text-gray-300">
                        Account created on:{" "}
                        <span className="text-gray-100">
                            {createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown"}
                        </span>
                    </p>
                </div>

                {/* Minimal Filing Cabinet Style Tabs */}
                <div className="relative mb-8">
                    {/* Tab Headers */}
                    <div className="flex space-x-1 mb-0">
                        <button
                            onClick={() => setActiveTab('forum')}
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                                activeTab === 'forum'
                                    ? 'bg-gray-800 bg-opacity-90 text-yellow-400 translate-y-0'
                                    : 'bg-gray-700 bg-opacity-60 text-gray-400 hover:text-gray-300 hover:bg-gray-600 hover:bg-opacity-70 translate-y-1'
                            }`}
                        >
                            Forum Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('scores')}
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
                                activeTab === 'scores'
                                    ? 'bg-gray-800 bg-opacity-90 text-yellow-400 translate-y-0'
                                    : 'bg-gray-700 bg-opacity-60 text-gray-400 hover:text-gray-300 hover:bg-gray-600 hover:bg-opacity-70 translate-y-1'
                            }`}
                        >
                            High Scores
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gray-800 bg-opacity-90 rounded-lg rounded-tl-none shadow-xl p-8">
                        {activeTab === 'forum' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-yellow-400">
                                        Forum Posts
                                    </h2>
                                    {totalPosts > 0 && (
                                        <span className="text-gray-400 text-sm">
                                            {totalPosts} total posts
                                        </span>
                                    )}
                                </div>
                                
                                {/* Top Pagination */}
                                {renderPagination()}
                                
                                {postsLoading ? (
                                    <p className="text-gray-400 text-center py-8">Loading posts...</p>
                                ) : userPosts.length > 0 ? (
                                    <div className="space-y-4 min-h-[400px]">
                                        {userPosts.map((post) => (
                                            <Link 
                                                key={post.postId}
                                                to={`/forum/thread/${post.threadId}?page=${post.pageNumber}#post-${post.postId}`}
                                                className="block bg-gray-700 bg-opacity-70 p-6 rounded-lg hover:bg-gray-600 hover:bg-opacity-80 transition-all duration-200 border border-gray-600 hover:border-yellow-400"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-yellow-400 font-medium text-lg">
                                                        {post.threadTitle}
                                                    </h3>
                                                    <span className="text-gray-400 text-sm whitespace-nowrap ml-4">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 text-base mb-3 line-clamp-3">
                                                    {post.content.length > 200 
                                                        ? `${post.content.substring(0, 200)}...`
                                                        : post.content
                                                    }
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500 text-sm">
                                                        in {post.categoryName}
                                                    </span>
                                                    <span className="text-blue-400 text-sm font-medium">
                                                        View Post →
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400 text-lg">No forum posts yet.</p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            Posts will appear here when {username} participates in forum discussions.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Bottom Pagination */}
                                {renderPagination()}
                            </div>
                        )}

                        {activeTab === 'scores' && (
                            <div>
                                <h2 className="text-2xl font-semibold text-yellow-400 mb-6">
                                    High Scores
                                </h2>
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-lg">High scores coming soon!</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Game scores and achievements will be displayed here once implemented.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
