require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

// Replace this with your actual MongoDB connection string
const databaseUrl = process.env.MONGODB_URI;

mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function clearActivityLogs() {
  try {
    // Clear project-level activity logs
    const projectResult = await Project.updateMany(
      {},
      { $set: { activityLog: [] } }
    );

    console.log(`Cleared activity logs for ${projectResult.modifiedCount} projects`);

    // Clear task-level activity logs
    const taskResult = await Project.updateMany(
      {},
      { $set: { "tasks.$[].activityLog": [] } }
    );

    console.log(`Cleared task activity logs in ${taskResult.modifiedCount} projects`);

    console.log('All project and task activity logs have been cleared');
  } catch (error) {
    console.error('Error clearing activity logs:', error);
  } finally {
    mongoose.disconnect();
  }
}

clearActivityLogs();
