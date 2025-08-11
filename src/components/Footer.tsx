export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 text-sm text-center py-6 border-t border-gray-800">
            © {new Date().getFullYear()} separrone.com | All rights reserved
        </footer>
    );
}