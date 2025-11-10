import React from "react";

function Post({ post }) {
    return (
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
            {/* Header: thông tin tác giả */}
            <div className="flex items-center mb-3">
                <img
                    src={`https://i.pravatar.cc/50?u=${post.author}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                    <h2 className="font-semibold">{post.author}</h2>
                    <p className="text-sm text-gray-500">
                        {post.major} • {post.time}
                    </p>
                </div>
            </div>

            {/* Nội dung bài viết */}
            <p className="mb-3 text-gray-800">{post.content}</p>

            {/* Ảnh hoặc video (nếu có) */}
            {post.image && (
                <img
                    src={post.image}
                    alt="post"
                    className="rounded-xl w-full mb-3"
                />
            )}
            {post.video && (
                <div className="mb-3">
                    <iframe
                        width="100%"
                        height="315"
                        src={post.video}
                        title="Video post"
                        className="rounded-xl"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            {/* Nút tương tác */}
            <div className="flex justify-between text-gray-600 text-sm border-t pt-2">
                <button className="hover:text-blue-500">
                    👍 Thích ({post.likes})
                </button>
                <button className="hover:text-blue-500">
                    💬 Bình luận ({post.comments})
                </button>
                <button className="hover:text-blue-500">↗ Chia sẻ</button>
            </div>
        </div>
    );
}

export default Post;
