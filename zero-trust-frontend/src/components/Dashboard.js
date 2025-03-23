import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/user-data");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Welcome to Dashboard</h2>
      {userData ? (
        <div>
          <p>Email: {userData.email}</p>
          <p>Blockchain Address: {userData.blockchainAddress}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default Dashboard;
