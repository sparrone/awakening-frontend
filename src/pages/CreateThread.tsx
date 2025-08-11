import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { env } from "../config/environment";

interface Category {
    id: number;
    name: string;
    description: string;
}

export default function CreateThread() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [category, setCategory] = useState<Category | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId, isLoggedIn, navigate]);

    const fetchCategory = async () => {
        try {
            const response = await fetch(`${env.apiBaseUrl}/forum/categories/${categoryId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch category');
            }
            const data = await response.json();
            setCategory(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${env.apiBaseUrl}/forum/threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    categoryId: parseInt(categoryId!)
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create thread');
            }

            const newThread = await response.json();
            navigate(`/forum/thread/${newThread.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create thread');
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) {
        return null;
    }

    if (error && !category) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="text-center text-red-400">
                        Error: {error}
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
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <nav className="text-sm text-gray-400 mb-4">
                        <Link to="/forum" className="hover:text-yellow-400">
                            Forum
                        </Link>
                        <span className="mx-2">›</span>
                        {category && (
                            <>
                                <Link 
                                    to={`/forum/category/${categoryId}`}
                                    className="hover:text-yellow-400"
                                >
                                    {category.name}
                                </Link>
                                <span className="mx-2">›</span>
                            </>
                        )}
                        <span>New Thread</span>
                    </nav>
                    <h1 className="text-3xl font-bold">Create New Thread</h1>
                    {category && (
                        <p className="text-gray-300 mt-2">in {category.name}</p>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                            Thread Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a descriptive title for your thread"
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                            Content *
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your thread content here..."
                            rows={12}
                            className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 resize-vertical focus:border-yellow-400 focus:outline-none"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={!title.trim() || !content.trim() || loading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Thread...' : 'Create Thread'}
                        </button>
                        <Link 
                            to={categoryId ? `/forum/category/${categoryId}` : '/forum'}
                            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-700 hover:border-gray-500 transition"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                <div className="mt-8 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">Forum Guidelines</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Be respectful and constructive in your discussions</li>
                        <li>• Use descriptive titles that clearly indicate your topic</li>
                        <li>• Search existing threads before creating a new one</li>
                        <li>• Stay on topic and relevant to the category</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}