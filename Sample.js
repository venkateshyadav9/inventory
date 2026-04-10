// import React, { useState, useEffect } from "react";
// import axios from "axios";

// function Assets() {
//   const [assets, setAssets] = useState([]);
//   const [addFormData, setAddFormData] = useState({ assetCode: "", assetName: "", quantity: 0 });
//   const [editingId, setEditingId] = useState(null);
//   const [editFormData, setEditFormData] = useState({ assetCode: "", assetName: "", quantity: 0 });

//   // Fetch assets
//   const fetchAssets = () => {
//     axios.get("http://localhost:5016/assets")
//       .then(res => setAssets(res.data))
//       .catch(err => console.error(err));
//   };

//   useEffect(() => {
//     fetchAssets();
//   }, []);

//   // Add Asset
//   const handleAddSubmit = (e) => {
//     e.preventDefault();
//     axios.post("http://localhost:5016/assets", addFormData)
//       .then(() => {
//         fetchAssets();
//         setAddFormData({ assetCode: "", assetName: "", quantity: 0 });
//       })
//       .catch(err => console.error(err));
//   };

//   // Start Edit
//   const startEdit = (asset) => {
//     setEditingId(asset.assetId);
//     setEditFormData({
//       assetCode: asset.assetCode,
//       assetName: asset.assetName,
//       quantity: asset.quantity
//     });
//   };

//   // Cancel Edit
//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditFormData({ assetCode: "", assetName: "", quantity: 0 });
//   };

//   // Save Edit
//   const saveEdit = (id) => {
//     axios.put(`http://localhost:5016/assets/${id}`, editFormData)
//       .then(() => {
//         fetchAssets();
//         cancelEdit();
//       })
//       .catch(err => console.error(err));
//   };

//   return (
//     <div style={{ maxWidth: "1500px", margin: "20px 20px 20px 60px", padding: "20px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
//       <h2>Assets</h2>

//       {/* Add Form */}
//       {/* <form onSubmit={handleAddSubmit} style={{ marginBottom: "20px" }}>

//         <input
//           name="assetCode"
//           placeholder="Code"
//           value={addFormData.assetCode}
//           onChange={(e) => setAddFormData({ ...addFormData, assetCode: e.target.value })}
//           required
//         />
//         <input
//           name="assetName"
//           placeholder="Name"
//           value={addFormData.assetName}
//           onChange={(e) => setAddFormData({ ...addFormData, assetName: e.target.value })}
//           required
//         />
//         <input
//           name="quantity"
//           type="number"
//           placeholder="Quantity"
//           value={addFormData.quantity}
//           onChange={(e) => setAddFormData({ ...addFormData, quantity: Number(e.target.value) })}
//           required
//         />
//         <button type="submit">Add</button>
//       </form> */}

//       <form onSubmit={handleAddSubmit} style={{ marginBottom: "20px" }}>

//         <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>

//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
//               Asset Code
//             </label>
//             <input
//               name="assetCode"
//               placeholder="Enter Asset Code"
//               value={addFormData.assetCode}
//               onChange={(e) =>
//                 setAddFormData({ ...addFormData, assetCode: e.target.value })
//               }
//               required
//             />
//           </div>

//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
//               Asset Name
//             </label>
//             <input
//               name="assetName"
//               placeholder="Enter Asset Name"
//               value={addFormData.assetName}
//               onChange={(e) =>
//                 setAddFormData({ ...addFormData, assetName: e.target.value })
//               }
//               required
//             />
//           </div>

//           <div style={{ display: "flex", flexDirection: "column" }}>
//             <label style={{ marginBottom: "5px", fontWeight: "bold" }}>
//               Quantity
//             </label>
//             <input
//               name="quantity"
//               placeholder="Enter Quantity"
//               type="number"
//               value={addFormData.quantity}
//               onChange={(e) =>
//                 setAddFormData({ ...addFormData, quantity: Number(e.target.value) })
//               }
//               required
//             />
//           </div>

//           <div>
//             <button type="submit" style={{ height: "35px" }}>
//               Add
//             </button>
//           </div>

//         </div>
//       </form>

//       {/* Assets Table */}
//       <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr style={{ backgroundColor: "#007bff", color: "#fff" }}>
//             <th>ID</th>
//             <th>Code</th>
//             <th>Name</th>
//             <th>Quantity</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {assets.map(asset => (
//             <tr key={asset.assetId}>
//               <td>{asset.assetId}</td>
//               <td>
//                 {editingId === asset.assetId ? (
//                   <input
//                     value={editFormData.assetCode}
//                     onChange={(e) => setEditFormData({ ...editFormData, assetCode: e.target.value })}
//                   />
//                 ) : asset.assetCode}
//               </td>
//               <td>
//                 {editingId === asset.assetId ? (
//                   <input
//                     value={editFormData.assetName}
//                     onChange={(e) => setEditFormData({ ...editFormData, assetName: e.target.value })}
//                   />
//                 ) : asset.assetName}
//               </td>
//               <td>
//                 {editingId === asset.assetId ? (
//                   <input
//                     type="number"
//                     value={editFormData.quantity}
//                     onChange={(e) => setEditFormData({ ...editFormData, quantity: Number(e.target.value) })}
//                   />
//                 ) : asset.quantity}
//               </td>
//               <td>
//                 {editingId === asset.assetId ? (
//                   <>
//                     <button onClick={() => saveEdit(asset.assetId)}>Save</button>
//                     <button onClick={cancelEdit}>Cancel</button>
//                   </>
//                 ) : (
//                   <button onClick={() => startEdit(asset)}>Edit</button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Assets;


// import React, { useState } from "react";
// import { Box, TextField, Button, Typography, Paper, Alert, } from "@mui/material";
// import axios from "axios";

// function Login({ onLogin }) {
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         axios.post("http://localhost:5016/login", { username, password })
//             .then(res => {
//                 // localStorage.setItem("user", JSON.stringify(res.data));
//                 sessionStorage.setItem("user", JSON.stringify(res.data));
//                 onLogin(res.data);
//             })
//             .catch(err => {
//                 setError("Invalid username or password");
//             });
//     };

//     return (
//         <Box
//             sx={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 backgroundColor: "#f0f2f5"
//             }}
//         >
//             <Paper
//                 elevation={8}
//                 sx={{
//                     padding: 4,
//                     width: 400,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     borderRadius: 3
//                 }}
//             >
//                 <Typography variant="h5" gutterBottom>
//                     Inventory System Login
//                 </Typography>

//                 {error && (
//                     <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
//                         {error}
//                     </Alert>
//                 )}

//                 <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", mt: 1 }}>
//                     <TextField
//                         label="Username"
//                         variant="outlined"
//                         fullWidth
//                         margin="normal"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         required
//                     />
//                     <TextField

//                         label="Password"
//                         variant="outlined"
//                         type="password"
//                         fullWidth
//                         margin="normal"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         color="primary"
//                         fullWidth
//                         sx={{ mt: 2 }}
//                     >
//                         Login
//                     </Button>
//                 </Box>
//             </Paper>
//         </Box>
//     );
// }

// export default Login;


// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import Assets from "./pages/Assets";
// import Employees from "./pages/Employees";
// import IssueAsset from "./pages/IssueAsset";
// import AssetReturn from "./pages/ReturnAsset";
// import Login from "./pages/Login";

// import "./App.css";

// function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser) setUser(JSON.parse(storedUser));
//   }, []);

//   if (!user) {
//     return <Login onLogin={setUser} />;
//   }

//   return (

//     <Router>
//       <Navbar
//         onLogout={() => {
//           localStorage.removeItem("user");
//           setUser(null);
//         }}
//       />

//       {/* CONTENT AREA */}
//       <div className="main-content">
//         <Routes>
//           <Route path="/" element={<Assets />} />
//           <Route path="/employees" element={<Employees />} />
//           <Route path="/issue" element={<IssueAsset />} />
//           <Route path="/return" element={<AssetReturn />} />
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </div>
//     </Router>

//   );
// }

// export default App;