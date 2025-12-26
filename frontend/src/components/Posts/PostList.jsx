import { useEffect, useState } from "react";
import API from "../../api/api";

export default function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    API.get("/posts").then((res) => setPosts(res.data));
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post._id} className="card mb-2">
          <div className="card-body">
            <strong>{post.user.username}</strong>
            <p>{post.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
