import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/admin.api";
import Header from "../reuse/header";

function AdminHomePage() {
    const { user: currentUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        username: "",
        email: "",
        role: "",
        major: "",
        bio: ""
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "student",
        major: ""
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (currentUser?.role !== "admin") {
            navigate("/");
            return;
        }

        fetchUsers();
    }, [pagination.page, roleFilter, isAuthenticated, currentUser]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAllUsers({
                page: pagination.page,
                limit: pagination.limit,
                search: search,
                role: roleFilter
            });

            if (response.success) {
                setUsers(response.data);
                setPagination(response.pagination);
            } else {
                setError("Failed to fetch users");
            }
        } catch (err) {
            console.error("Fetch users error:", err);
            setError(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination({ ...pagination, page: 1 });
        fetchUsers();
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            const response = await adminAPI.deleteUser(userId);
            if (response.success) {
                alert("User deleted successfully");
                fetchUsers();
            } else {
                alert(response.message || "Failed to delete user");
            }
        } catch (err) {
            console.error("Delete user error:", err);
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user._id);
        setEditForm({
            username: user.username || "",
            email: user.email || "",
            role: user.role || "",
            major: user.major || "",
            bio: user.bio || ""
        });
    };

    const handleUpdate = async (userId) => {
        try {
            const response = await adminAPI.updateUser(userId, editForm);
            if (response.success) {
                alert("User updated successfully");
                setEditingUser(null);
                fetchUsers();
            } else {
                alert(response.message || "Failed to update user");
            }
        } catch (err) {
            console.error("Update user error:", err);
            alert(err.response?.data?.message || "Failed to update user");
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setEditForm({
            username: "",
            email: "",
            role: "",
            major: "",
            bio: ""
        });
    };



    const handleAddUser = () => {
        setShowAddModal(true);
        setAddForm({
            username: "",
            email: "",
            password: "",
            role: "student",
            major: ""
        });
    };

    const handleCreateUser = async () => {
        if (!addForm.email || !addForm.password) {
            alert("Email and password are required");
            return;
        }

        if (addForm.password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            const response = await adminAPI.createUser(addForm);
            if (response.success) {
                alert("User created successfully!");
                setShowAddModal(false);
                setAddForm({
                    username: "",
                    email: "",
                    password: "",
                    role: "student",
                    major: ""
                });
                fetchUsers();
            } else {
                alert(response.message || "Failed to create user");
            }
        } catch (err) {
            console.error("Create user error:", err);
            alert(err.response?.data?.message || "Failed to create user");
        }
    };

    const handleCancelAdd = () => {
        setShowAddModal(false);
        setAddForm({
            username: "",
            email: "",
            password: "",
            role: "student",
            major: ""
        });
    };



    const generatePassword = () => {
        // Generate a random 8-character password
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setAddForm({ ...addForm, password });
    };

    if (!isAuthenticated || currentUser?.role !== "admin") {
        return null;
    }

    return (
        <div>
            <Header />
            <div className="container my-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>User Management</h2>
                    <button
                        className="btn btn-success"
                        onClick={handleAddUser}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Account
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setPagination({ ...pagination, page: 1 });
                                    }}
                                >
                                    <option value="">All Roles</option>
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Users Table */}
                <div className="card">
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-5">
                                <p className="text-muted">No users found</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Major</th>
                                                <th>Created At</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id}>
                                                    {editingUser === user._id ? (
                                                        <>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={editForm.username}
                                                                    onChange={(e) =>
                                                                        setEditForm({
                                                                            ...editForm,
                                                                            username: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="email"
                                                                    className="form-control form-control-sm"
                                                                    value={editForm.email}
                                                                    onChange={(e) =>
                                                                        setEditForm({
                                                                            ...editForm,
                                                                            email: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className="form-select form-select-sm"
                                                                    value={editForm.role}
                                                                    onChange={(e) =>
                                                                        setEditForm({
                                                                            ...editForm,
                                                                            role: e.target.value
                                                                        })
                                                                    }
                                                                >
                                                                    <option value="student">Student</option>
                                                                    <option value="admin">Admin</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={editForm.major}
                                                                    onChange={(e) =>
                                                                        setEditForm({
                                                                            ...editForm,
                                                                            major: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-success me-1"
                                                                    onClick={() => handleUpdate(user._id)}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>{user.username || "N/A"}</td>
                                                            <td>{user.email}</td>
                                                            <td>
                                                                <span
                                                                    className={`badge ${user.role === "admin"
                                                                        ? "bg-danger"
                                                                        : "bg-primary"
                                                                        }`}
                                                                >
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td>{user.major || "N/A"}</td>
                                                            <td>
                                                                {new Date(user.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-primary me-1"
                                                                    onClick={() => handleEdit(user)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(user._id)}
                                                                    disabled={user._id === currentUser?._id}
                                                                    title={user._id === currentUser?._id ? "You cannot delete your own account" : user.role === "admin" ? "Cannot delete admin accounts" : ""}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="d-flex justify-content-end align-items-center mt-3">
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li
                                                className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        setPagination({
                                                            ...pagination,
                                                            page: pagination.page - 1
                                                        })
                                                    }
                                                    disabled={pagination.page === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {[...Array(pagination.pages)].map((_, i) => (
                                                <li
                                                    key={i + 1}
                                                    className={`page-item ${pagination.page === i + 1 ? "active" : ""
                                                        }`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() =>
                                                            setPagination({
                                                                ...pagination,
                                                                page: i + 1
                                                            })
                                                        }
                                                    >
                                                        {i + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            <li
                                                className={`page-item ${pagination.page === pagination.pages ? "disabled" : ""
                                                    }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        setPagination({
                                                            ...pagination,
                                                            page: pagination.page + 1
                                                        })
                                                    }
                                                    disabled={pagination.page === pagination.pages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Account Modal */}
            {showAddModal && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex="-1"
                    onClick={handleCancelAdd}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New Account</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCancelAdd}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="addUsername" className="form-label">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="addUsername"
                                        value={addForm.username}
                                        onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="addEmail" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="addEmail"
                                        value={addForm.email}
                                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="addPassword" className="form-label">
                                        Password <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="addPassword"
                                            value={addForm.password}
                                            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                            placeholder="Enter password (min 6 characters)"
                                            minLength={6}
                                            required
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={generatePassword}
                                            title="Generate random password"
                                        >
                                            <i className="bi bi-shuffle"></i> Generate
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="addRole" className="form-label">
                                        Role
                                    </label>
                                    <select
                                        className="form-select"
                                        id="addRole"
                                        value={addForm.role}
                                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                                    >
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="addMajor" className="form-label">
                                        Major
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="addMajor"
                                        value={addForm.major}
                                        onChange={(e) => setAddForm({ ...addForm, major: e.target.value })}
                                        placeholder="Enter major"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancelAdd}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateUser}
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminHomePage;

