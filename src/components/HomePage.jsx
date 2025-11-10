import { useAuth } from "../contexts/AuthContext";
import AdminHomePage from "./admin/adminHomePage";
import UserHomePage from "./user/userHomePage";

function HomePage() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // If user is admin, show admin dashboard
    if (isAuthenticated && user?.role === "admin") {
        return <AdminHomePage />;
    }

    // Otherwise show user home page
    return <UserHomePage />;
}

export default HomePage;

