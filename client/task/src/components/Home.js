import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";
import { FaGithub, FaPlus, FaSearch, FaCloudUploadAlt } from "react-icons/fa";

const Home = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [sortOption, setSortOption] = useState("Sort by activity ⬇");
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    if (!hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true"); 
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, []);

  
  useEffect(() => {
    sessionStorage.removeItem("refreshed"); 
  }, []);

  const handleImport = (repoName) => {
    navigate(`/import/${repoName}`);
  };

  const handleGitHubLogin = () => {
    window.location.href = "https://sooru-ai.onrender.com/api/auth/github";
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newToken = urlParams.get("token");
  
    if (newToken) {
      localStorage.setItem("token", newToken);
      window.history.replaceState({}, document.title, "/home"); 
    }
  }, []);
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decoded = JSON.parse(atob(token.split(".")[1])); 
        const userId = decoded.id;

        const response = await axios.get(
          `https://sooru-ai.onrender.com/api/user/${userId}`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
        setLoading(false);

        if (response.data.githubId) {
          fetchRepositories();
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

 

    const fetchRepositories = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await axios.get(
          "https://sooru-ai.onrender.com/api/github/repos",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRepos(response.data);
      } catch (error) {
        console.error("Error fetching repos:", error);
 
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleGitHubConnect = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent("https://sooru-ai.onrender.com/api/auth/github/callback");
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo&redirect_uri=${redirectUri}`;
  };
  

  const handleCreateDocument = () => {
    if (user?.githubId) {
      setShowPopup(true);
    } else {
      handleGitHubConnect();
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  
  return (
    <div className="home-container" >
      {/* Dashboard Header */}
      <div className="dashboard-header">
  <h2 style={{position:"relative", top:"13px"}}>Dashboard</h2>
  <div className="buttons" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
    {!user?.githubId && (
      <button className="githubb-btn github-btn" onClick={handleGitHubLogin} style={{ width: "auto", height: "auto" }}>
        <FaGithub className="githubb-icon" /> Connect to GitHub
      </button>
    )}
    {user?.githubId && (
      <button className="githubb-btn github-btn" onClick={handleCreateDocument} style={{ width: "auto", height: "auto" ,background:"#016601"}}>
        <FaPlus className="icon" style={{color:"white"}} /> Create New Project
      </button>
    )}
  </div>
</div>


      <div className="home-content">
      {/* Search Bar and Controls */}
      <div className="unique-header-controls">
      <div className="unique-search-container">
      
      <FaSearch style={{color:"black"}} />
        <input
          type="text"
          className="unique-search-box"
          placeholder="Search Repositories and Projects..."
        />
      </div>
        <button className="unique-add-btn">
          Search
        </button>
      
        </div>
      


      <div className="unique-main-content">
        <FaCloudUploadAlt className="unique-upload-icon" />
        <h3>Create your first project</h3>
        <p>Connect your GitHub repository and generate AI-powered documentation effortlessly.</p>
      </div>


        
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2 className="popup-title">Import Git Repository</h2>
            <h2 className="close-btn" onClick={() => setShowPopup(false)}>✖</h2>
            
            {/* GitHub Username & Search Box */}
            <div className="popup-header">
              <div className="github-user">
                <FaGithub className="github-icon" />
                {user?.username || "GitHub User"}
              </div>
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Repository List */}
            <div className="repo-list-container">
              <ul className="repo-list">
                {filteredRepos.length > 0 ? (
                  filteredRepos.map((repo) => (
                    <li key={repo.id} className="repo-item">
                      <span>{repo.name}</span>
                      <button className="import-btn" onClick={() => handleImport(repo.name)}>Import</button>
                    </li>
                  ))
                ) : (
                  <p className="no-repos">No repositories found.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
