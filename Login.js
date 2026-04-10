import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    InputAdornment
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import MemoryIcon from "@mui/icons-material/Memory";

import axios from "axios";



function Login({ onLogin }) {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post("http://localhost:5016/login", { username, password })
            .then(res => {
                sessionStorage.setItem("user", JSON.stringify(res.data));
                onLogin(res.data);
            })
            .catch(() => {
                setError("Invalid username or password");
            });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                /* ✅ BACKGROUND IMAGE */
                backgroundImage: "url('/Images/Chip.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative"
            }}
        >

            {/* ✅ DARK OVERLAY */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                        "linear-gradient(rgba(0, 0, 0, 0.41), rgba(0,0,0,0.85))"
                }}
            />

            {/* ✅ LOGIN CARD */}
            <Paper
                elevation={12}
                sx={{
                    position: "relative",
                    zIndex: 2,
                    padding: 5,
                    width: 420,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(15px)",
                    color: "white",
                    textAlign: "center"
                }}
            >

                {/* CHIP ICON */}
                <MemoryIcon
                    sx={{
                        fontSize: 55,
                        color: "#4fc3f7",
                        mb: 1
                    }}
                />

                <Typography variant="h5" fontWeight="bold">
                    Chip Testing Inventory
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ mb: 3, opacity: 0.8 }}
                >
                    Secure Asset Management Portal
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* FORM */}
                <Box component="form" onSubmit={handleSubmit}>

                    <TextField
                        label="Username"
                        autoComplete="username"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon />
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            input: { color: "white" },
                            label: { color: "#ddd" }
                        }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        autoComplete="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon />
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            input: { color: "white" },
                            label: { color: "#ddd" }
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            py: 1.2,
                            fontWeight: "bold",
                            fontSize: "16px",
                            background:
                                "linear-gradient(90deg,#00c6ff,#0072ff)",
                            borderRadius: "10px",
                            textTransform: "none",
                            transition: "0.3s",
                            "&:hover": {
                                transform: "scale(1.05)",
                                boxShadow:
                                    "0 6px 20px rgba(0,0,0,0.5)"
                            }
                        }}
                    >
                        Login
                    </Button>

                </Box>

            </Paper>
        </Box>
    );
}

export default Login;