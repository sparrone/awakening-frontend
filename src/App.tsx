import { Routes, Route } from "react-router-dom";
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';
import CreateAccount from './pages/CreateAccount';
import RegistrationSuccess from './pages/RegistrationSuccess';
import EmailVerified from "./pages/EmailVerified";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import ForumHome from "./pages/ForumHome";
import CategoryView from "./pages/CategoryView";
import ThreadView from "./pages/ThreadView";
import CreateThread from "./pages/CreateThread";

function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={
                    <>
                        <Hero />
                        <About />
                    </>
                } />
                <Route path="/create-account" element={<CreateAccount />} />
                <Route path="/registration-success" element={<RegistrationSuccess />} />
                <Route path="/email-verified" element={<EmailVerified />} />
                <Route path="/login" element={<Login />} />
                <Route path="/users/:username" element={<Profile />} />
                <Route path="/account" element={<AccountSettings />} />
                <Route path="/forum" element={<ForumHome />} />
                <Route path="/forum/category/:categoryId" element={<CategoryView />} />
                <Route path="/forum/category/:categoryId/new-thread" element={<CreateThread />} />
                <Route path="/forum/thread/:threadId" element={<ThreadView />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;
