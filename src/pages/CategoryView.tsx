import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getThreadsPerPage } from "../utils/userSettings";
import { env } from "../config/environment";

interface Category {
    id: number;
    name: string;
    description: string;
}

interface Thread {
    id: number;
    title: string;
    createdBy: {
        id: number;
        username: string;
    };
    createdAt: string;
    lastPostAt: string;
    isPinned: boolean;
    isLocked: boolean;
}

interface ThreadsResponse {
    category: Category;
    threads: Thread[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
}

export default function CategoryView() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { isLoggedIn } = useAuth();
    const [data, setData] = useState<ThreadsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (categoryId) {
            fetchThreads(currentPage);
        }
    }, [categoryId, currentPage]);

    const fetchThreads = async (page: number) => {
        try {
            setLoading(true);
            const threadsPerPage = getThreadsPerPage();
            const response = await fetch(
                `${env.apiBaseUrl}/forum/categories/${categoryId}/threads?page=${page}&size=${threadsPerPage}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch threads');
            }
            const responseData = await response.json();
            setData(responseData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="text-center">Loading threads...</div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="text-center text-red-400">
                        Error: {error || 'Category not found'}
                    </div>
                    <div className="text-center mt-4">
                        <Link to="/forum" className="text-yellow-400 hover:text-yellow-300">
                            ← Back to Forum
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <nav className="text-sm text-gray-400 mb-2">
                            <Link to="/forum" className="hover:text-yellow-400">
                                Forum
                            </Link>
                            <span className="mx-2">›</span>
                            <span>{data.category.name}</span>
                        </nav>
                        <h1 className="text-3xl font-bold">{data.category.name}</h1>
                        {data.category.description && (
                            <p className="text-gray-300 mt-2">{data.category.description}</p>
                        )}
                    </div>
                    {isLoggedIn && (
                        <Link to={`/forum/category/${categoryId}/new-thread`}>
                            <button className="btn-primary">
                                New Thread
                            </button>
                        </Link>
                    )}
                </div>

                <div className="space-y-2">
                    {data.threads.map((thread) => (
                        <Link
                            key={thread.id}
                            to={`/forum/thread/${thread.id}`}
                            className="block bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-800 hover:border-yellow-400 transition duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {thread.isPinned && (
                                            <span className="text-yellow-400 text-sm">📌</span>
                                        )}
                                        {thread.isLocked && (
                                            <span className="text-red-400 text-sm">🔒</span>
                                        )}
                                        <h3 className="text-lg font-semibold text-white">
                                            {thread.title}
                                        </h3>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        Started by <Link 
                                            to={`/users/${thread.createdBy.username}`}
                                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {thread.createdBy.username}
                                        </Link>
                                        <span className="mx-2">•</span>
                                        {formatDate(thread.createdAt)}
                                    </div>
                                </div>
                                <div className="text-right text-sm text-gray-400">
                                    <div>Last post:</div>
                                    <div>{formatDate(thread.lastPostAt)}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {data.threads.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        No threads in this category yet.
                        {isLoggedIn && (
                            <div className="mt-4">
                                <Link to={`/forum/category/${categoryId}/new-thread`}>
                                    <button className="btn-primary">
                                        Create the first thread
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {data.totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        {currentPage > 0 && (
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            >
                                Previous
                            </button>
                        )}
                        
                        {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                            const pageNum = Math.max(0, Math.min(data.totalPages - 5, currentPage - 2)) + i;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 rounded ${
                                        pageNum === currentPage
                                            ? 'bg-yellow-500 text-black'
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                                >
                                    {pageNum + 1}
                                </button>
                            );
                        })}

                        {currentPage < data.totalPages - 1 && (
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            >
                                Next
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}