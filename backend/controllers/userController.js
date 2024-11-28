const User = require("../models/User");

exports.checkUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.json(!!user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking user existence", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.toString() });
  }
};

exports.getCurrentUserProfile = async (req, res) => {
  try {
    console.log('Getting profile for user ID:', req.user.userId);
    
    const user = await User.findById(req.user.userId)
      .select('username email name birthDate socialMedia');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ 
      message: "Error fetching user profile", 
      error: error.message 
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    console.log('Updating profile for user ID:', req.user.userId);
    console.log('Update data:', req.body);

    const { email, name, birthDate, socialMedia } = req.body;
    
    // Create update object with only allowed fields
    const updateData = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (birthDate) updateData.birthDate = birthDate;
    if (socialMedia) updateData.socialMedia = socialMedia;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('username email name birthDate socialMedia');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ 
      message: "Error updating user profile", 
      error: error.message 
    });
  }
};

exports.findUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finding user', error: error.message });
  }
};
