import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Home() {
  const [popup, setPopup] = useState("");
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [isPosting, setIsPosting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const highlightedPostId = location.state?.postId;
  const token = localStorage.getItem("token");

  // 🔔 Popup auto hide
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  // 📥 Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🎯 Scroll to highlighted post
  useEffect(() => {
    if (highlightedPostId) {
      setTimeout(() => {
        document
          .getElementById(highlightedPostId)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [posts, highlightedPostId]);

  // 🔐 Auth check
  const requireAuth = () => {
    if (!token) {
      setPopup("⚠ Please login or signup first");
      setTimeout(() => navigate("/signup", { replace: true }), 1500);
      return false;
    }
    return true;
  };

  // 🚀 CREATE POST (FIXED)
  const createPost = async () => {
    if (!requireAuth()) return;
    if (!text.trim() && !image) return;
    if (isPosting) return; // 🚫 prevent multiple clicks

    setIsPosting(true);
    setCooldown(5);

    const formData = new FormData();
    formData.append("text", text.trim());
    if (image) formData.append("image", image);

    try {
      await API.post("/posts", formData);

      setText("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchPosts();
    } catch (err) {
      console.error("Post failed", err);
      setPopup("Post creation failed");
    }

    // ⏳ Cooldown Timer
    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft--;
      setCooldown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(interval);
        setIsPosting(false);
      }
    }, 1000);
  };

  // ❤️ Like
  const likePost = async (id) => {
    if (!requireAuth()) return;

    try {
      await API.post(`/posts/like/${id}`);
      fetchPosts();
    } catch (err) {
      console.error("Like failed", err);
      setPopup("Failed to like post");
    }
  };

  // 💬 Comment
  const addComment = async (id) => {
    if (!requireAuth()) return;
    if (!commentText[id]?.trim()) return;

    try {
      await API.post(`/posts/comment/${id}`, {
        text: commentText[id],
      });

      setCommentText({ ...commentText, [id]: "" });
      fetchPosts();
    } catch (err) {
      console.error("Comment failed", err);
      setPopup("Failed to add comment");
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      {popup && <div className="alert alert-danger text-center">{popup}</div>}

      {/* 📝 CREATE POST */}
      <div className="card p-3 mb-4">
        <h5>Hey🙋‍♂️! Create A Post :</h5>

        <textarea
          className="form-control mb-2 mt-3"
          placeholder="What's on your mind Today?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!token || isPosting}
        />

        <input
          type="file"
          className="form-control mb-2 mt-2"
          accept="image/*"
          disabled={!token || isPosting}
          ref={fileInputRef}
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          className="btn btn-success w-100 mt-3"
          onClick={createPost}
          disabled={isPosting}
        >
          {isPosting
            ? `⏳ Hang Tight! Your Post is Being Shared...... (${cooldown}s)`
            : "Post it Out 😄"}
        </button>
      </div>

      {/* 📭 No Posts */}
      {posts.length === 0 && (
        <p className="text-center text-muted">No posts yet 🥺</p>
      )}

      {/* 📦 POSTS */}
      {posts.map((p) => {
        const user = p.user;

        return (
          <div key={p._id} id={p._id} className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <img
                  src={
                    user?.profilePic ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  width="40"
                  height="40"
                  className="rounded-circle me-2"
                  alt="profile"
                />

                <span
                  className="fw-bold text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (!requireAuth()) return;
                    navigate(`/user/${user._id}`);
                  }}
                >
                  {user?.username || "Unknown User"}
                </span>
              </div>

              <p className="mb-2">{p.text}</p>

              {p.image && (
                <img
                  src={p.image}
                  className="img-fluid rounded mb-2"
                  alt="post"
                />
              )}

              <div className="mb-2">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => likePost(p._id)}
                >
                  ❤️ {p.likes?.length || 0}
                </button>
              </div>

              <div className="mt-2">
                {p.comments?.map((c, i) => (
                  <p key={i} className="mb-1">
                    <b>{c.user?.username || "User"}</b>: {c.text}
                  </p>
                ))}

                <input
                  className="form-control form-control-sm mt-2"
                  placeholder="Add a comment..."
                  value={commentText[p._id] || ""}
                  disabled={!token}
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [p._id]: e.target.value,
                    })
                  }
                />

                <button
                  className="btn btn-sm btn-secondary mt-1"
                  onClick={() => addComment(p._id)}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
