import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategories, type Category } from "../lib/firestore";

export default function ForumHome() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="text-center">Loading forum...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="text-center text-red-400">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0e0e0e] text-white pt-20">
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Forum</h1>
                </div>

                <div className="space-y-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/forum/category/${category.id}`}
                            className="block bg-gray-900 border border-gray-700 rounded-lg p-6 hover:bg-gray-800 hover:border-yellow-400 transition duration-200"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold text-yellow-400 mb-2">
                                        {category.name}
                                    </h2>
                                    {category.description && (
                                        <p className="text-gray-300 text-sm">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    <div>→</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        No categories found. Categories will appear here once they are created.
                    </div>
                )}
            </div>
        </div>
    );
}
