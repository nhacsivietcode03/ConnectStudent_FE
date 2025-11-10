import React, { useState, useEffect, use } from "react";
import Header from "../reuse/header";
import Post from "./Post";
import "../../assets/Modal.css"


function UserHomePage() {
    const [posts, setPosts] = useState([]);
    const [modal, setModal] = useState(false)
    useEffect(() => {
        const mockPosts = [
            {
                id: 1,
                author: "Nguyễn Văn A",
                major: "CNTT",
                time: "2 giờ trước",
                content: "Buổi workshop về ReactJS siêu thú vị hôm nay 🎉",
                image: "https://picsum.photos/500/300",
                likes: 24,
                comments: 3,
            },
        ];
        setPosts(mockPosts);
    }, []);

    const toggleModal = () => {
        setModal(!modal)
    }

    return (
        <div>
            <Header />

            <main className="max-w-2xl mx-auto mt-6 px-4">
                {/* Nút tạo bài viết */}
                <div className="bg-white rounded-2xl p-4 shadow mb-6 flex justify-between items-center">
                    <p className="text-gray-700 font-medium">Chia sẻ điều gì đó với mọi người</p>
                    <button
                        onClick={toggleModal}
                        className="btn btn-primary px-4 py-2 bg-blue-500 text-white btn-modal"
                    >
                        Create
                    </button>
                </div>

                {/* Danh sách bài viết */}
                {posts.map((post) => (
                    <Post key={post.id} post={post} />
                ))}

                {modal && (
                    <div className="modal">
                        <div className="overlay" onClick={toggleModal}></div>
                        <div className="modal-content">
                            <h2>Hello modal</h2>
                            <p>lore</p>
                            <button className="close-modal" onClick={toggleModal}>close</button>
                        </div>
                    </div>
                )}
            </main>



        </div>
    );
}

export default UserHomePage;
