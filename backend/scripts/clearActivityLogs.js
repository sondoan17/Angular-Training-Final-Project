require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

const databaseUrl = process.env.MONGODB_URI;

mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function clearActivityLogs() {
  try {
    
    const projectsWithLogs = await Project.aggregate([
      {
        $project: {
          projectLogCount: { $size: "$activityLog" },
          taskLogsCount: {
            $reduce: {
              input: "$tasks",
              initialValue: 0,
              in: { 
                $add: [
                  "$$value",
                  { $size: "$$this.activityLog" }
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalProjectLogs: { $sum: "$projectLogCount" },
          totalTaskLogs: { $sum: "$taskLogsCount" }
        }
      }
    ]);

    const totalProjectLogs = projectsWithLogs[0]?.totalProjectLogs || 0;
    const totalTaskLogs = projectsWithLogs[0]?.totalTaskLogs || 0;

   
    const projectResult = await Project.updateMany(
      {},
      { $set: { activityLog: [] } }
    );

   
    const taskResult = await Project.updateMany(
      {},
      { $set: { "tasks.$[].activityLog": [] } }
    );

    console.log('Activity Logs Clearing Summary:');
    console.log('--------------------------------');
    console.log(`Projects affected: ${projectResult.modifiedCount}`);
    console.log(`Project-level logs deleted: ${totalProjectLogs}`);
    console.log(`Task-level logs deleted: ${totalTaskLogs}`);
    console.log(`Total logs deleted: ${totalProjectLogs + totalTaskLogs}`);
    console.log('--------------------------------');

  } catch (error) {
    console.error('Error clearing activity logs:', error);
  } finally {
    mongoose.disconnect();
  }
}

clearActivityLogs();
