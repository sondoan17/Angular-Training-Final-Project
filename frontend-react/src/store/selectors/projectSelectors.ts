import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectProjectsState = (state: RootState) => state.projects;

export const selectAllProjects = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.allProjects
);

export const selectRecentProjects = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.recentProjects
);

export const selectIsLoading = createSelector(
  [selectProjectsState],
  (projectsState) => projectsState.isLoading
);

export const selectCreatedProjects = createSelector(
  [selectAllProjects, (state: RootState, userId: string) => userId],
  (projects, userId) => 
    projects.filter(project => 
      project?.createdBy?._id.toString() === userId.toString()
    )
);

export const selectMemberProjects = createSelector(
  [selectAllProjects, (state: RootState, userId: string) => userId],
  (projects, userId) => 
    projects.filter(project => 
      project?.createdBy?._id.toString() !== userId.toString() && 
      project?.members?.some(m => m?._id.toString() === userId.toString())
    )
); 