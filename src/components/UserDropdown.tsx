import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.ts";

type MenuItem =
    | { type: "link"; label: string; to: string }
    | { type: "button"; label: string; action: () => void };

export default function UserDropdown() {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuItemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
        navigate("/"); // Redirect to homepage after logout
    };

    const menuItems: MenuItem[] = [
        { type: "link", label: "Profile", to: `/users/${username ?? ""}` },
        { type: "link", label: "Account Settings", to: "/account" },
        { type: "button", label: "Logout", action: () => handleLogout() },
    ];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "Escape") {
                setIsOpen(false);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedIndex((prev) => (prev + 1) % menuItems.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
            } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const item = menuItemsRef.current[focusedIndex];
                item?.click();
            }
        };

        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, focusedIndex, menuItems.length]);

    useEffect(() => {
        if (isOpen && menuItemsRef.current[focusedIndex]) {
            menuItemsRef.current[focusedIndex]?.focus();
        }
    }, [focusedIndex, isOpen]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setFocusedIndex(0); // focus first item when opened
                }}
                className="flex items-center gap-1 hover:text-yellow-400"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls="user-menu"
            >
                {username}
                <span
                    className={`text-xs transform transition-transform ${
                        isOpen ? "rotate-180" : "rotate-0"
                    }`}
                >
                    ▼
                </span>
            </button>
            {isOpen && (
                <div
                    id="user-menu"
                    role="menu"
                    className="absolute right-0 mt-2 w-36 bg-gray-800 text-white rounded shadow-md z-10"
                >
                    {menuItems.map((item, index) =>
                        item.type === "link" ? (
                            <Link
                                key={item.label}
                                to={item.to}
                                className="dropdown-item"
                                role="menuitem"
                                tabIndex={index === focusedIndex ? 0 : -1}
                                ref={(el) => {
                                    menuItemsRef.current[index] = el;
                                }}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <button
                                key={item.label}
                                onClick={item.action}
                                className="dropdown-item w-full text-left"
                                role="menuitem"
                                tabIndex={index === focusedIndex ? 0 : -1}
                                ref={(el) => {
                                    menuItemsRef.current[index] = el;
                                }}
                            >
                                {item.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}