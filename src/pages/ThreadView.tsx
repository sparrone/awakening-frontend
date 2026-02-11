import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPostsPerPage } from "../utils/userSettings";
import {
    getThread,
    getPostsByThread,
    getCategory,
    createPost as firestoreCreatePost,
    type Thread,
    type Post,
    type Category,
} from "../lib/firestore";

interface ThreadViewData {
    thread: Thread & { category: Category };
    posts: Post[];
    currentPage: number;
    totalPages: number;
    totalElements: number;
}

export default function ThreadView() {
    const { threadId } = useParams<{ threadId: string }>();
    const { isLoggedIn } = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [data, setData] = useState<ThreadViewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [replyContent, setReplyContent] = useState("");
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        if (threadId) {
            const pageParam = searchParams.get('page');
            const targetPage = pageParam ? parseInt(pageParam) : 0;
            setCurrentPage(targetPage);
            fetchAll(targetPage);
        }
    }, [threadId, searchParams]);

    useEffect(() => {
        if (threadId && !searchParams.get('page')) {
            fetchPosts(currentPage);
        }
    }, [currentPage]);

    // Effect to scroll to specific post after data loads
    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = [];

        if (data && data.posts && location.hash) {
            const postId = location.hash.replace('#post-', '');

            if (postId) {
                const attemptScroll = (attempts = 0) => {
                    const element = document.getElementById(`post-${postId}`);

                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.style.backgroundColor = 'rgba(234, 179, 8, 0.4)';
                        element.style.border = '2px solid rgba(234, 179, 8, 0.8)';
                        element.style.transition = 'background-color 0.3s ease, border 0.3s ease';
                        const fadeTimeout = setTimeout(() => {
                            if (element) {
                                element.style.backgroundColor = '';
                                element.style.border = '';
                            }
                        }, 3000);
                        timeouts.push(fadeTimeout);
                    } else if (attempts < 15) {
                        const retryTimeout = setTimeout(() => attemptScroll(attempts + 1), 100 * (attempts + 1));
                        timeouts.push(retryTimeout);
                    }
                };

                const initialTimeout = setTimeout(() => attemptScroll(), 300);
                timeouts.push(initialTimeout);
            }
        }

        return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    }, [data, location.hash]);

    const fetchAll = async (page: number) => {
        try {
            setLoading(true);
            const thread = await getThread(threadId!);
            const category = await getCategory(thread.categoryId);
            const postsPerPage = getPostsPerPage();
            const postsData = await getPostsByThread(threadId!, page, postsPerPage);
            setData({
                thread: { ...thread, category },
                ...postsData,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (page: number) => {
        if (!data) return;
        try {
            setLoading(true);
            const postsPerPage = getPostsPerPage();
            const postsData = await getPostsByThread(threadId!, page, postsPerPage);
            setData((prev) => prev ? { ...prev, ...postsData } : null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || submittingReply || !threadId) return;

        setSubmittingReply(true);
        try {
            await firestoreCreatePost(threadId, replyContent);
            setReplyContent("");
            fetchPosts(currentPage);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to post reply');
        } finally {
            setSubmittingReply(false);
        }
    };

    const formatDate = (dateOrTimestamp: any) => {
        const date = dateOrTimestamp?.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
        return date.toLocaleDateString('en-US', {
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

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="text-center">Loading thread...</div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="text-center text-red-400">
                        Error: {error || 'Thread not found'}
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
                <div className="mb-8">
                    <nav className="text-sm text-gray-400 mb-2">
                        <Link to="/forum" className="hover:text-yellow-400">
                            Forum
                        </Link>
                        <span className="mx-2">›</span>
                        <Link
                            to={`/forum/category/${data.thread.category.id}`}
                            className="hover:text-yellow-400"
                        >
                            {data.thread.category.name}
                        </Link>
                        <span className="mx-2">›</span>
                        <span>{data.thread.title}</span>
                    </nav>

                    <div className="flex items-center gap-2 mb-2">
                        {data.thread.isPinned && (
                            <span className="text-yellow-400">📌</span>
                        )}
                        {data.thread.isLocked && (
                            <span className="text-red-400">🔒</span>
                        )}
                        <h1 className="text-3xl font-bold">{data.thread.title}</h1>
                    </div>
                </div>

                <div className="space-y-4">
                    {data.posts.map((post, index) => (
                        <div
                            key={post.id}
                            id={`post-${post.id}`}
                            className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden transition-all duration-1000"
                        >
                            <div className="flex">
                                <div className="w-48 bg-gray-800 p-4 border-r border-gray-700">
                                    <div className="text-center">
                                        <Link
                                            to={`/users/${post.authorUsername}`}
                                            className="text-yellow-400 font-semibold mb-2 hover:text-yellow-300 transition-colors"
                                        >
                                            {post.authorUsername}
                                        </Link>
                                        <div className="text-xs text-gray-400">
                                            Posts: {index === 0 ? "Original Post" : `#${index + 1}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-400 mb-2">
                                            <span>{formatDate(post.createdAt)}</span>
                                            {post.editedAt && (
                                                <span className="ml-2">(edited: {formatDate(post.editedAt)})</span>
                                            )}
                                        </div>
                                        <div className="text-white whitespace-pre-wrap">
                                            {post.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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

                {isLoggedIn && !data.thread.isLocked && (
                    <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Post Reply</h3>
                        <form onSubmit={handleReplySubmit}>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 resize-vertical"
                                disabled={submittingReply}
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    disabled={!replyContent.trim() || submittingReply}
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingReply ? 'Posting...' : 'Post Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {!isLoggedIn && (
                    <div className="mt-8 text-center text-gray-400">
                        <Link to="/login" className="text-yellow-400 hover:text-yellow-300">
                            Log in
                        </Link>
                        {" "}to post a reply
                    </div>
                )}

                {data.thread.isLocked && (
                    <div className="mt-8 text-center text-red-400">
                        This thread is locked and cannot receive new replies.
                    </div>
                )}
            </div>
        </div>
    );
}
