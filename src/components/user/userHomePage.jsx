
import Header from "../reuse/header";
import {
    Container,
} from "react-bootstrap";
import Post from "./Post";

function UserHomePage() {

    return (
        <div>
            <Header />
            <Container className="my-4" style={{ maxWidth: "800px" }}>

                <Post />
            </Container>
        </div>
    );
}

export default UserHomePage;
