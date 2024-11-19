import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProjectState, Project } from '../../types/project.types';
import { projectService } from '../../services/api/projectService';

const initialState: ProjectState = {
  allProjects: [],
  recentProjects: [],
  isLoading: false,
  error: null
};

// Thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await projectService.getUserProjects();
      return projects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRecentProjects = createAsyncThunk(
  'projects/fetchRecent',
  async (_, { rejectWithValue }) => {
    try {
      const projects = await projectService.getRecentProjects();
      return projects;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData: { name: string; description: string }, { dispatch, rejectWithValue }) => {
    try {
      const newProject = await projectService.createProject(projectData);
      dispatch(fetchProjects());
      return newProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId: string, { dispatch, rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId);
      dispatch(fetchProjects());
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'projects/updateTaskStatus',
  async ({ projectId, taskId, status }: { projectId: string; taskId: string; status: string }, 
    { rejectWithValue }) => {
    try {
      const updatedProject = await projectService.updateTaskStatus(projectId, taskId, status);
      return updatedProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allProjects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Recent Projects
      .addCase(fetchRecentProjects.fulfilled, (state, action) => {
        state.recentProjects = action.payload;
      })
      .addCase(updateTaskStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedProject = action.payload;
        state.allProjects = state.allProjects.map(project => 
          project._id === updatedProject._id ? updatedProject : project
        );
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export default projectsSlice.reducer; 