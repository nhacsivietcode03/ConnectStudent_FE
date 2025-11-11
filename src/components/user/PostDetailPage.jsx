import React from "react";
import { useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "../reuse/header";
import PostDetail from "./PostDetail";

function PostDetailPage() {
	const { id } = useParams();
	return (
		<div>
			<Header />
			<Container className="my-4" style={{ maxWidth: "800px" }}>
				<PostDetail postId={id} asPage />
			</Container>
		</div>
	);
}

export default PostDetailPage;


