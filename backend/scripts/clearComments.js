require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

const databaseUrl = process.env.MONGODB_URI;

mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });

async function clearComments() {
  try {

    const projectsWithComments = await Project.aggregate([
      {
        $project: {
          taskCommentsCount: {
            $reduce: {
              input: "$tasks",
              initialValue: 0,
              in: { 
                $add: [
                  "$$value",
                  { $size: { $ifNull: ["$$this.comments", []] } }
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalComments: { $sum: "$taskCommentsCount" },
          totalProjects: { $sum: 1 }
        }
      }
    ]);

    const totalComments = projectsWithComments[0]?.totalComments || 0;
    const totalProjects = projectsWithComments[0]?.totalProjects || 0;


    const result = await Project.updateMany(
      {},
      { $set: { "tasks.$[].comments": [] } }
    );

    console.log('Comments Clearing Summary:');
    console.log('--------------------------------');
    console.log(`Total projects scanned: ${totalProjects}`);
    console.log(`Projects affected: ${result.modifiedCount}`);
    console.log(`Total comments deleted: ${totalComments}`);
    console.log('--------------------------------');

  } catch (error) {
    console.error('Error clearing comments:', error);
  } finally {
    mongoose.disconnect();
  }
}

clearComments();
