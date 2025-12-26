import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= FETCH PROFILE + POSTS ================= */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const userRes = await API.get(`/users/${id}`);
      setUser(userRes.data.user);
      setIsFollowing(userRes.data.isFollowing || false);

      const meRes = await API.get("/users/profile");
      setLoggedUserId(meRes.data._id);

      const postRes = await API.get(`/posts/user/${id}`);
      setPosts(postRes.data || []);
    } catch (err) {
      console.error("Failed to load user profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ================= FOLLOW / UNFOLLOW ================= */
  const toggleFollow = async () => {
    try {
      setActionLoading(true);
      await API.post(`/users/${isFollowing ? "unfollow" : "follow"}/${id}`);
      fetchProfile();
    } catch (err) {
      console.error("Follow action failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const isOwnProfile = loggedUserId === id;

  if (loading) return <h5 className="text-center mt-5">Loading profile...</h5>;

  if (!user)
    return <h5 className="text-center mt-5 text-danger">User not found</h5>;

  /* ================= OPEN CHAT ================= */
  const openChat = () => {
    if (!user?._id) return;
    navigate(`/chat/${user._id}`);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* ================= LEFT : PROFILE ================= */}
        <div className="col-md-6">
          <div className="card p-4 text-center h-100">
            <img
              src={
                user.profilePic
                  ? `http://localhost:5000/uploads/${user.profilePic}`
                  : "https://via.placeholder.com/150"
              }
              width="140"
              height="140"
              className="rounded-circle mx-auto mb-3"
              style={{ objectFit: "cover" }}
              alt="profile"
            />

            <h4>{user.username}</h4>
            <p className="text-muted">{user.bio || "No bio added"}</p>

            {!isOwnProfile && (
              <>
                <button
                  className={`btn ${
                    isFollowing ? "btn-danger" : "btn-primary"
                  } w-50 mx-auto mb-2`}
                  onClick={toggleFollow}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Please wait..."
                    : isFollowing
                      ? "Unfollow"
                      : "Follow"}
                </button>

                {/* ✅ MESSAGE BUTTON */}
                <button
                  className="btn btn-outline-success w-50 mx-auto"
                  onClick={openChat}
                >
                  💬 Message
                </button>
              </>
            )}

            <hr />

            <div className="d-flex justify-content-around">
              <div>
                <b>{user.followers?.length || 0}</b>
                <div className="text-muted">Followers</div>
              </div>
              <div>
                <b>{user.following?.length || 0}</b>
                <div className="text-muted">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="d-none d-md-block col-md-1 d-flex justify-content-center">
          <div style={{ width: "2px", background: "#ddd", height: "100%" }} />
        </div>

        {/* ================= RIGHT : POSTS ================= */}
        <div className="col-md-5">
          <h4 className="mb-3">Posts 📝 :</h4>

          {posts.length === 0 && <p className="text-muted">No posts yet</p>}

          {posts.map((p) => (
            <div
              key={p._id}
              className="card mb-4"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/home", { state: { postId: p._id } })}
            >
              {p.image && (
                <img
                  src={`http://localhost:5000/uploads/${p.image}`}
                  className="card-img-top"
                  alt="post"
                />
              )}
              <div className="card-body">
                <p>{p.text}</p>
                <small className="text-muted">
                  ❤️ {p.likes?.length || 0} likes
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
