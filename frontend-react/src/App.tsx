import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import Layout from "./components/layout/Layout";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import "./App.css";
import ProjectDetails from "./pages/project-details/ProjectDetails";
import TaskDetails from './pages/task-details/TaskDetails';
import AssignedTasks from './pages/assigned-tasks/AssignedTasks';
import Search from './pages/search/Search';
import Profile from './pages/profile/Profile';
import ChatBox from './components/Chat/ChatBox';
import { useAuth } from './hooks/useAuth';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
            <Route path="/assigned-tasks" element={<AssignedTasks />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
        
        {/* ChatBox will appear on all authenticated pages */}
        {isAuthenticated && <ChatBox />}
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
